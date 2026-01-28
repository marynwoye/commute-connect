import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCommuteGroup } from "./api";

// page stylying 
import "./ui.css";
import "./CommuteProfileForm.css";

export default function CreateGroupPage() {
  const navigate = useNavigate(); // moves to another page after you create a group 

// Accessing localStorage was learned from [9]
// Used to read the loggedin user details
// so the correct employee ID is used when creating a group 
  const savedUser = JSON.parse(localStorage.getItem("user"));  // gets logged in user from local storge 
  const creatorId = savedUser?.EmployeeID;   // loged in employee id used for group creator 

  const [form, setForm] = useState({
    GroupType: "carpool",
    GroupName: "",
    MeetPointName: "",
    DaysOfWeek: "",
    MeetTime: "",
    MaxMembers: 4,
  });

  const [error, setError] = useState("");  // stores error messages to show on screen 

  function handleChange(e) {  // update form state when user types or selects options 
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {  // submit form to backend to create a new group
    e.preventDefault();  // stop page refresh 
    setError("");   // clears old errors 

    try {
      await createCommuteGroup({  // sends form data to API including the creator ID
        ...form,
        CreatorEmployeeID: creatorId,
      });

      alert("Group created!");
      navigate("/groups");   // go back to the groups page 
    } catch (err) {
      setError(err.message);  // shows backend error message
    }
  }
// JSX layout for the create group form 
  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="form-wrapper">
          <div className="form-card">
            <h2>Create Commute Group</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#555" }}>
              Fill in the details below to create a new group.
            </p>
            {/* Form submits using handleSubmit */}
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
              {/* Show error message if something goes wrong */}

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
