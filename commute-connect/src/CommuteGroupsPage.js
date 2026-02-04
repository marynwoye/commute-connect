import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getCommuteGroups,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  updateCommuteGroup,
  deleteCommuteGroup,
  getCommuteProfiles, // ✅ AI uses this existing endpoint
} from "./api";

import "./ui.css";
import "./CommuteProfileForm.css";

// React useState,useEffect learned from
// The Net Ninja YouTube tutorial [8]
// The pattern was adapted to manage UI state, filters, and backend data
// for the commute groups feature
export default function CommuteGroupsPage() {
  const [type, setType] = useState("carpool"); // which commute type tab is selected default being carpool
  const [groups, setGroups] = useState([]); // list of groups returned by the backend for the selected type
  const [expandedGroupId, setExpandedGroupId] = useState(null); // stores the group that is expanded
  const [membersByGroup, setMembersByGroup] = useState({});

  // filter values
  const [genderFilter, setGenderFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // ✅ AI recommendation state
  const [myProfile, setMyProfile] = useState(null);

  // ✅ UI: show/hide compact AI panel (default closed)
  const [showRecommendations, setShowRecommendations] = useState(false);

  // ✅ Jump-to-group refs
  const groupRefs = useRef({});

  // get the logged in user from localStorage once
  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const employeeId = savedUser?.EmployeeID; // logged in employee ID
  const loggedInFirstName = savedUser?.FirstName || ""; // ✅ AI uses this to match profile

  // =====================
  // Edit/Delete group state
  // =====================
  const [editingGroupId, setEditingGroupId] = useState(null); // stores which group is being edited
  const [editForm, setEditForm] = useState({
    GroupName: "",
    MeetPointName: "",
    DaysOfWeek: "",
    MeetTime: "",
    MaxMembers: "",
  });

  async function refreshGroups(currentType) {
    // load groups from the backend
    const data = await getCommuteGroups(currentType, {
      gender: genderFilter,
      department: departmentFilter,
      location: locationFilter,
    });
    setGroups(Array.isArray(data) ? data : []);
  }

  // Reload groups when type or filters chnage
  // This useEffect pattern was learned from a GeeksforGeeks tutorial on fetching data [7]
  // I adapted it by calling my own backend function refreshGroups
  // and reloading the data when the commute type or filters change.
  useEffect(() => {
    refreshGroups(type);
    setExpandedGroupId(null);
    // close edit form if user changes tabs/filters
    setEditingGroupId(null);
  }, [type, genderFilter, departmentFilter, locationFilter]);

  // ✅ AI: load commute profiles and match one for the logged-in user by FirstName (demo approach)
  useEffect(() => {
    async function loadMyProfile() {
      if (!loggedInFirstName) {
        setMyProfile(null);
        return;
      }

      try {
        const profiles = await getCommuteProfiles();
        const list = Array.isArray(profiles) ? profiles : [];

        // Match by FirstName (demo only — no DB change required)
        const matches = list.filter(
          (p) =>
            (p.FirstName || "").trim().toLowerCase() ===
            loggedInFirstName.trim().toLowerCase()
        );

        // If multiple profiles match, choose newest
        matches.sort((a, b) => Number(b.ProfileID || 0) - Number(a.ProfileID || 0));
        setMyProfile(matches[0] || null);
      } catch (e) {
        setMyProfile(null);
      }
    }

    loadMyProfile();
  }, [loggedInFirstName]);

  // show or hide group members
  async function toggleMembers(groupId) {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
      return;
    }
    setExpandedGroupId(groupId);

    const members = await getGroupMembers(groupId);
    setMembersByGroup((prev) => ({ ...prev, [groupId]: members }));
  }

  // ✅ Jump from a recommended group to the real group card
  function openRecommendedGroup(g) {
    const targetType = (g.GroupType || "").toLowerCase();

    // Switch tab if needed (this triggers refreshGroups via useEffect)
    if (targetType && targetType !== type) {
      setType(targetType);
    }

    // Close the recommendations panel (optional but feels nice)
    setShowRecommendations(false);

    // Scroll after render/refresh
    setTimeout(() => {
      const el = groupRefs.current[g.GroupID];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // OPTIONAL: auto-open members when you jump
      // toggleMembers(g.GroupID);
    }, 250);
  }

  // join a group
  async function handleJoin(groupId) {
    if (!employeeId) {
      alert("You must be logged in to join a group.");
      return;
    }

    try {
      await joinGroup(groupId, employeeId);
      alert("Joined group successfully!");

      await refreshGroups(type);

      const members = await getGroupMembers(groupId);
      setMembersByGroup((prev) => ({ ...prev, [groupId]: members }));
      setExpandedGroupId(groupId);
    } catch (e) {
      alert(e.message);
    }
  }

  //  Leave a group
  async function handleLeave(groupId) {
    if (!employeeId) {
      alert("You must be logged in to leave a group.");
      return;
    }

    const ok = window.confirm("Are you sure you want to leave this group?");
    if (!ok) return;

    try {
      await leaveGroup(groupId, employeeId);
      alert("You left the group.");

      // refresh list so member counts update
      await refreshGroups(type);

      // refresh members list for this group if open
      const members = await getGroupMembers(groupId);
      setMembersByGroup((prev) => ({ ...prev, [groupId]: members }));

      // close members panel
      setExpandedGroupId(null);
    } catch (e) {
      alert(e.message);
    }
  }

  // =====================
  // Edit / Delete group handlers
  // =====================

  // start editing a commute group
  function startEditGroup(g) {
    setEditingGroupId(g.GroupID);
    setEditForm({
      GroupName: g.GroupName || "",
      MeetPointName: g.MeetPointName || "",
      DaysOfWeek: g.DaysOfWeek || "",
      MeetTime: g.MeetTime || "",
      MaxMembers: String(g.MaxMembers ?? ""),
    });
  }

  // cancel editing
  function cancelEdit() {
    setEditingGroupId(null);
  }

  // save edit to backend (creator only)
  async function saveEdit(groupId) {
    if (!employeeId) {
      alert("You must be logged in to edit a group.");
      return;
    }

    try {
      await updateCommuteGroup(groupId, editForm, employeeId);
      alert("Group updated successfully!");
      setEditingGroupId(null);
      await refreshGroups(type);
    } catch (e) {
      alert(e.message);
    }
  }

  // delete group from backend (creator only)
  async function handleDeleteGroup(groupId) {
    if (!employeeId) {
      alert("You must be logged in to delete a group.");
      return;
    }

    const ok = window.confirm(
      "Are you sure you want to delete this group? This cannot be undone."
    );
    if (!ok) return;

    try {
      await deleteCommuteGroup(groupId, employeeId);
      alert("Group deleted successfully!");
      await refreshGroups(type);
      setExpandedGroupId(null);
      setEditingGroupId(null);
    } catch (e) {
      alert(e.message);
    }
  }

  // checking if a group is full
  function isGroupFull(g) {
    return Number(g.CurrentMembers) >= Number(g.MaxMembers);
  }

  // reseting all filters
  // The filter functionality using state, controlled inputs, and clearing filters
  // was based on a DEV.to article [10]
  // I adapted this approach to filter commute groups by gender, department, and location.
  function clearFilters() {
    setGenderFilter("");
    setDepartmentFilter("");
    setLocationFilter("");
  }

  // ==========================
  // ✅ AI: Rule-based scoring
  // ==========================
  function normalize(s) {
    return (s || "").toString().trim().toLowerCase();
  }

  function scoreGroupForProfile(group, profile) {
    if (!profile) return 0;

    let score = 0;

    const profileDept = normalize(profile.Department);
    const profileGender = normalize(profile.Gender);
    const profileMeetup = normalize(profile.MeetupLocation);
    const profileTransport = normalize(profile.TransportPreference);

    const creatorDept = normalize(group.CreatorDepartment);
    const creatorGender = normalize(group.CreatorGender);
    const meetPoint = normalize(group.MeetPointName);
    const groupType = normalize(group.GroupType);

    // Department match
    if (profileDept && creatorDept && profileDept === creatorDept) score += 3;

    // Meetup location match (contains)
    if (profileMeetup && meetPoint && meetPoint.includes(profileMeetup)) score += 4;

    // Gender match (optional)
    if (profileGender && creatorGender && profileGender === creatorGender) score += 1;

    // Transport preference match to group type
    if (profileTransport && groupType && groupType.includes(profileTransport)) score += 2;

    return score;
  }

  // ✅ AI: calculate top 3 recommended groups from the currently loaded groups list
  const recommended = useMemo(() => {
    if (!myProfile || !Array.isArray(groups) || groups.length === 0) return [];

    const scored = groups
      .map((g) => ({ group: g, score: scoreGroupForProfile(g, myProfile) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return scored;
  }, [groups, myProfile]);

  // main page layout container
  return (
    <div className="page-wrapper">
      <div className="page-container">
        <h2 className="page-title">Commute Groups</h2>

        {/* ✅ AI Recommended section (compact + toggle, clickable recommendations) */}
        <div
          className="card"
          style={{
            marginBottom: 12,
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span aria-hidden="true">⭐</span>
                <span>AI recommendations</span>
              </div>

              {/* Small, one-line context (kept subtle) */}
              {savedUser && myProfile ? (
                <div
                  className="text-muted"
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={`Based on: ${myProfile.Department}, meetup: ${myProfile.MeetupLocation}`}
                >
                  Based on: <strong>{myProfile.Department}</strong> • Meetup:{" "}
                  <strong>{myProfile.MeetupLocation}</strong>
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                  Personalised suggestions (optional)
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowRecommendations((p) => !p)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                whiteSpace: "nowrap",
              }}
            >
              {showRecommendations ? "Hide" : "Show"}
            </button>
          </div>

          {showRecommendations && (
            <div
              style={{
                marginTop: 10,
                borderTop: "1px solid rgba(0,0,0,0.08)",
                paddingTop: 10,
                maxHeight: 230,
                overflowY: "auto",
              }}
            >
              {!savedUser && (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Log in to see recommendations.
                </div>
              )}

              {savedUser && !myProfile && (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  No commute profile found for <strong>{savedUser?.FirstName}</strong>. Create
                  your commute profile to see recommendations.
                </div>
              )}

              {savedUser && myProfile && recommended.length === 0 && (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  No strong matches found yet. Try creating more groups or adjust meetup
                  locations/departments.
                </div>
              )}

              {savedUser && myProfile && recommended.length > 0 && (
                <div style={{ display: "grid", gap: 8 }}>
                  {recommended.map(({ group: g, score }) => (
                    <div
                      key={`rec-${g.GroupID}`}
                      onClick={() => openRecommendedGroup(g)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openRecommendedGroup(g);
                      }}
                      style={{
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 12,
                        padding: 10,
                        background: "rgba(0,0,0,0.01)",
                        cursor: "pointer",
                      }}
                      title="Click to jump to this group"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "75%",
                          }}
                          title={g.GroupName}
                        >
                          {g.GroupName}{" "}
                          <span className="badge">{g.GroupType.toUpperCase()}</span>
                        </div>

                        <span className="text-muted" style={{ fontSize: 12 }}>
                          Score: {score}
                        </span>
                      </div>

                      <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                        <strong>Meet:</strong> {g.MeetPointName}
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        <strong>Time:</strong> {g.DaysOfWeek} • {g.MeetTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/*  Filter section connected to react state */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 10 }}>
            Filter groups
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            {/* Gender filter */}
            <div>
              <div className="text-muted" style={{ fontWeight: 700, marginBottom: 6 }}>
                Gender
              </div>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Department filter */}
            <div>
              <div className="text-muted" style={{ fontWeight: 700, marginBottom: 6 }}>
                Department
              </div>
              <input
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                placeholder="e.g. IT, Audit, Tax"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            {/* Location filter */}
            <div>
              <div className="text-muted" style={{ fontWeight: 700, marginBottom: 6 }}>
                Location
              </div>
              <input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. Dundrum, Phoenix Park"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          <div className="btn-row">
            {/* Button to reset all filters */}
            <button className="btn-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          <div className="text-muted" style={{ marginTop: 8 }}></div>
        </div>

        {/* Tabs to switch commute type*/}
        <div className="tabs">
          <button
            className={`tab-btn ${type === "carpool" ? "active" : ""}`}
            onClick={() => setType("carpool")}
          >
            Carpool
          </button>
          <button
            className={`tab-btn ${type === "walk" ? "active" : ""}`}
            onClick={() => setType("walk")}
          >
            Walk
          </button>
          <button
            className={`tab-btn ${type === "luas" ? "active" : ""}`}
            onClick={() => setType("luas")}
          >
            LUAS
          </button>
        </div>

        {groups.length === 0 && (
          <div className="card">
            <div className="card-title">No groups available</div>
            <div className="text-muted">Try another commute type or change your filters.</div>
          </div>
        )}

        {groups.map((g) => {
          const full = isGroupFull(g);

          //  determine membership only if members list for this group is loaded
          const loadedMembers = membersByGroup[g.GroupID] || [];
          const isMember = loadedMembers.some((m) => m.EmployeeID === employeeId);

          // determine if logged in user is the creator of the group
          const isCreator = String(g.CreatorEmployeeID) === String(employeeId);

          return (
            <div
              key={g.GroupID}
              className="card"
              ref={(el) => {
                if (el) groupRefs.current[g.GroupID] = el;
              }}
            >
              {/* Top row title actions */}
              <div className="group-header">
                <div>
                  <div className="card-title">
                    {g.GroupName}
                    <span className="badge">{g.GroupType.toUpperCase()}</span>
                  </div>
                  <div className="text-muted">
                    <strong>Meet point:</strong> {g.MeetPointName}
                  </div>
                </div>

                <div className="btn-row" style={{ justifyContent: "flex-end", marginTop: 0 }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleJoin(g.GroupID)}
                    disabled={full}
                    style={full ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                  >
                    {full ? "Full" : "Join"}
                  </button>

                  <button className="btn-secondary" onClick={() => toggleMembers(g.GroupID)}>
                    {expandedGroupId === g.GroupID ? "Hide members" : "View members"}
                  </button>

                  {/* Leave button shows when members panel is open and user is a member */}
                  {expandedGroupId === g.GroupID && isMember && (
                    <button className="btn-secondary" onClick={() => handleLeave(g.GroupID)}>
                      Leave group
                    </button>
                  )}

                  {/* Edit/Delete buttons show only if user is group creator */}
                  {isCreator && (
                    <>
                      <button className="btn-secondary" onClick={() => startEditGroup(g)}>
                        Edit
                      </button>
                      <button className="btn-secondary" onClick={() => handleDeleteGroup(g.GroupID)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Middle infomation grid */}
              <div className="group-grid">
                <div className="text-muted">
                  <strong>Schedule:</strong> {g.DaysOfWeek} • {g.MeetTime}
                </div>
                <div className="text-muted">
                  <strong>Members:</strong> {g.CurrentMembers}/{g.MaxMembers}{" "}
                  {full ? <span className="danger">(Full)</span> : null}
                </div>
                <div className="text-muted group-contact">
                  <strong>Contact:</strong> {g.CreatorFirstName} {g.CreatorLastName} — {g.CreatorEmail}
                </div>

                {/*  show creator dept/gender if returned */}
                {(g.CreatorDepartment || g.CreatorGender) && (
                  <div className="text-muted group-contact">
                    <strong>Creator:</strong>{" "}
                    {g.CreatorDepartment ? `Dept: ${g.CreatorDepartment}` : ""}
                    {g.CreatorDepartment && g.CreatorGender ? " • " : ""}
                    {g.CreatorGender ? `Gender: ${g.CreatorGender}` : ""}
                  </div>
                )}
              </div>

              {/* Edit form (only visible when editing this group) */}
              {editingGroupId === g.GroupID && (
                <div className="card" style={{ marginTop: 12 }}>
                  <div className="card-title" style={{ marginBottom: 10 }}>
                    Edit group
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      value={editForm.GroupName}
                      onChange={(e) => setEditForm((p) => ({ ...p, GroupName: e.target.value }))}
                      placeholder="Group name"
                      style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
                    />

                    <input
                      value={editForm.MeetPointName}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, MeetPointName: e.target.value }))
                      }
                      placeholder="Meet point name"
                      style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
                    />

                    <input
                      value={editForm.DaysOfWeek}
                      onChange={(e) => setEditForm((p) => ({ ...p, DaysOfWeek: e.target.value }))}
                      placeholder="Days of week (e.g. Mon, Wed)"
                      style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
                    />

                    <input
                      value={editForm.MeetTime}
                      onChange={(e) => setEditForm((p) => ({ ...p, MeetTime: e.target.value }))}
                      placeholder="Meet time (e.g. 08:00)"
                      style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
                    />

                    <input
                      value={editForm.MaxMembers}
                      onChange={(e) => setEditForm((p) => ({ ...p, MaxMembers: e.target.value }))}
                      placeholder="Max members"
                      style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
                    />
                  </div>

                  <div className="btn-row" style={{ marginTop: 10 }}>
                    <button className="btn-primary" onClick={() => saveEdit(g.GroupID)}>
                      Save changes
                    </button>
                    <button className="btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Members list */}
              {expandedGroupId === g.GroupID && (
                <div className="group-members">
                  <div className="text-muted" style={{ fontWeight: 700, marginBottom: 8 }}>
                    Group members
                  </div>
                  <ul className="member-list">
                    {loadedMembers.map((m) => (
                      <li key={m.EmployeeID}>
                        {m.FirstName} {m.LastName}{" "}
                        <span className="text-muted">({m.Department || "N/A"})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
