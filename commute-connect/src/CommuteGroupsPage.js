import React, { useEffect, useMemo, useState } from "react";
import { getCommuteGroups, getGroupMembers, joinGroup } from "./api";
import "./ui.css";
import "./CommuteProfileForm.css";

export default function CommuteGroupsPage() {
  const [type, setType] = useState("carpool");
  const [groups, setGroups] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [membersByGroup, setMembersByGroup] = useState({});

  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const employeeId = savedUser?.EmployeeID;

  async function refreshGroups(currentType) {
    const data = await getCommuteGroups(currentType);
    setGroups(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refreshGroups(type);
    setExpandedGroupId(null);
  }, [type]);

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

  function isGroupFull(g) {
    return Number(g.CurrentMembers) >= Number(g.MaxMembers);
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <h2 className="page-title">Commute Groups</h2>

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
            <div className="text-muted">Try another commute type or create a new group.</div>
          </div>
        )}

        {groups.map((g) => {
          const full = isGroupFull(g);

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
              </div>

              {/* Members list */}
              {expandedGroupId === g.GroupID && (
                <div className="group-members">
                  <div className="text-muted" style={{ fontWeight: 700, marginBottom: 8 }}>
                    Group members
                  </div>
                  <ul className="member-list">
                    {(membersByGroup[g.GroupID] || []).map((m) => (
                      <li key={m.EmployeeID}>
                        {m.FirstName} {m.LastName} <span className="text-muted">({m.Department || "N/A"})</span>
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
