// CommuteProfileForm.js
import React, { useState } from "react";
import { createCommuteProfile } from "./api";
import { useNavigate } from "react-router-dom";
import "./CommuteProfileForm.css";  // <-- IMPORTANT: import CSS file

// 10 Meetup Locations
const meetupLocations = [
  "Tallaght Luas Stop",
  "Heuston Station",
  "Ranelagh Luas Stop",
  "Sandyford Luas Stop",
  "Abbey Street Luas Stop",
  "St. Stephen's Green",
  "Smithfield Square",
  "O’Connell Street",
  "Grand Canal Dock",
  "Broombridge Luas Stop",
];

export default function CommuteProfileForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    FirstName: "",
    Department: "",
    Gender: "",
    WorkHours: "",
    TransportPreference: "",
    MeetupLocation: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await createCommuteProfile(form);
    alert(res.message || "Commute profile created!");

    navigate("/map"); // redirect to map
  };

  return (
    <div className="form-wrapper">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Create Commute Profile</h2>

        <label>First Name</label>
        <input
          name="FirstName"
          placeholder="Enter your first name"
          onChange={handleChange}
          required
        />

        <label>Department</label>
        <input
          name="Department"
          placeholder="e.g. HR, Finance, IT"
          onChange={handleChange}
          required
        />

        <label>Gender</label>
        <select name="Gender" onChange={handleChange} required>
          <option value="">Select gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        <label>Work Hours</label>
        <input
          name="WorkHours"
          placeholder="e.g. 9am - 5pm"
          onChange={handleChange}
          required
        />

        <label>Transport Preference</label>
        <input
          name="TransportPreference"
          placeholder="Bus, Luas, Train"
          onChange={handleChange}
          required
        />

        <label>Meetup Location</label>
        <select name="MeetupLocation" onChange={handleChange} required>
          <option value="">Choose a meetup point</option>
          {meetupLocations.map((loc, idx) => (
            <option key={idx} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <button type="submit">Save Commute Profile</button>
      </form>
    </div>
  );
}
