import React, { useEffect, useMemo, useState } from "react";
import { getCommuteGroups, getGroupMembers, joinGroup, leaveGroup } from "./api";

import "./ui.css";
import "./CommuteProfileForm.css";

export default function CommuteGroupsPage() {
  const [type, setType] = useState("carpool");
  const [groups, setGroups] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [membersByGroup, setMembersByGroup] = useState({});

  // ✅ filter state
  const [genderFilter, setGenderFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const employeeId = savedUser?.EmployeeID;

  async function refreshGroups(currentType) {
    const data = await getCommuteGroups(currentType, {
      gender: genderFilter,
      department: departmentFilter,
      location: locationFilter,
    });
    setGroups(Array.isArray(data) ? data : []);
  }

  // ✅ Refresh when type or filters change
  useEffect(() => {
    refreshGroups(type);
    setExpandedGroupId(null);
  }, [type, genderFilter, departmentFilter, locationFilter]);

  async function toggleMembers(groupId) {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
      return;
    }
    setExpandedGroupId(groupId);

    const members = await getGroupMembers(groupId);
    setMembersByGroup((prev) => ({ ...prev, [groupId]: members }));
  }

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

  // ✅ NEW: Leave group handler (added only, nothing removed)
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

      // refresh members list for this group (if open)
      const members = await getGroupMembers(groupId);
      setMembersByGroup((prev) => ({ ...prev, [groupId]: members }));

      // optional: close members panel
      setExpandedGroupId(null);
    } catch (e) {
      alert(e.message);
    }
  }

  function isGroupFull(g) {
    return Number(g.CurrentMembers) >= Number(g.MaxMembers);
  }

  function clearFilters() {
    setGenderFilter("");
    setDepartmentFilter("");
    setLocationFilter("");
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <h2 className="page-title">Commute Groups</h2>

        {/* ✅ Filter box */}
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
            {/* Gender */}
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

            {/* Department */}
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

            {/* Location */}
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
            <button className="btn-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          <div className="text-muted" style={{ marginTop: 8 }}>
            Tip: department and location filters work as text search.
          </div>
        </div>

        {/* Tabs */}
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
            <div className="text-muted">
              Try another commute type or change your filters.
            </div>
          </div>
        )}

        {groups.map((g) => {
          const full = isGroupFull(g);

          // ✅ NEW: determine membership ONLY if members list for this group is loaded
          const loadedMembers = membersByGroup[g.GroupID] || [];
          const isMember = loadedMembers.some((m) => m.EmployeeID === employeeId);

          return (
            <div key={g.GroupID} className="card">
              {/* Top row: title + actions */}
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

                  {/* ✅ NEW: Leave button shows when members panel is open AND user is a member */}
                  {expandedGroupId === g.GroupID && isMember && (
                    <button className="btn-secondary" onClick={() => handleLeave(g.GroupID)}>
                      Leave group
                    </button>
                  )}
                </div>
              </div>

              {/* Middle info grid */}
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

                {/* Optional: show creator dept/gender if returned */}
                {(g.CreatorDepartment || g.CreatorGender) && (
                  <div className="text-muted group-contact">
                    <strong>Creator:</strong>{" "}
                    {g.CreatorDepartment ? `Dept: ${g.CreatorDepartment}` : ""}
                    {g.CreatorDepartment && g.CreatorGender ? " • " : ""}
                    {g.CreatorGender ? `Gender: ${g.CreatorGender}` : ""}
                  </div>
                )}
              </div>

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
