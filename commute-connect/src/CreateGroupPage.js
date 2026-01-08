import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCommuteGroup } from "./api";

// ✅ styling (reuses your existing form styling + shared page layout)
import "./ui.css";
import "./CommuteProfileForm.css";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("user"));
  const creatorId = savedUser?.EmployeeID;

  const [form, setForm] = useState({
    GroupType: "carpool",
    GroupName: "",
    MeetPointName: "",
    DaysOfWeek: "",
    MeetTime: "",
    MaxMembers: 4,
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await createCommuteGroup({
        ...form,
        CreatorEmployeeID: creatorId,
      });

      alert("Group created!");
      navigate("/groups");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="form-wrapper">
          <div className="form-card">
            <h2>Create Commute Group</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#555" }}>
              Fill in the details below to create a new group.
            </p>

            <form onSubmit={handleSubmit}>
              <label>Group Type</label>
              <select
                name="GroupType"
                value={form.GroupType}
                onChange={handleChange}
                required
              >
                <option value="carpool">Carpool</option>
                <option value="walk">Walk</option>
                <option value="luas">LUAS</option>
              </select>

              <label>Group Name</label>
              <input
                name="GroupName"
                value={form.GroupName}
                onChange={handleChange}
                required
              />

              <label>Meet Point Name (exact)</label>
              <input
                name="MeetPointName"
                value={form.MeetPointName}
                onChange={handleChange}
                required
                placeholder="e.g. Dundrum LUAS Stop / Outside Centra Cork St"
              />

              <label>Days of Week</label>
              <input
                name="DaysOfWeek"
                value={form.DaysOfWeek}
                onChange={handleChange}
                required
                placeholder="e.g. Mon,Tue,Thu"
              />

              <label>Meet Time</label>
              <input
                name="MeetTime"
                value={form.MeetTime}
                onChange={handleChange}
                required
                placeholder="e.g. 08:10"
              />

              <label>Max Members</label>
              <input
                type="number"
                name="MaxMembers"
                value={form.MaxMembers}
                onChange={handleChange}
                min={2}
                max={20}
                required
              />

              <button type="submit">Create Group</button>

              {error && (
                <p style={{ marginTop: "10px", color: "red", textAlign: "center" }}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
