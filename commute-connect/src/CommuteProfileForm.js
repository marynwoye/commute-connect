// allows employees to creare a commute profile 
// the imformation entered is submtted to the backend and stored in the SQL database
// redirects user to intercative map after submission 
// displays location as green pin 


// API function sending post request to backend 
import React, { useState } from "react";
import { createCommuteProfile } from "./api"; 
import { useNavigate } from "react-router-dom";  // used for redirecting after submisstion to map
import "./CommuteProfileForm.css";  // css file for form style

// Dropdown options matching lookup table in Mapselector.js
// location matches a co ordinates 
const meetupLocations = [
  "Tallaght Luas Stop",
  "Heuston Station",
  "Ranelagh Luas Stop",
  "Sandyford Luas Stop",
  "Stephens Green Luas Stop",
  "Dundrum Luas Stop",
  "Broombridge Luas Stop",
  "George's Street Arcade",
  "O'Connell Street Spire",
  "Trinity College Front Gate",
  "Temple Bar Square",
  "Grand Canal Dock",
  "Clonskeagh Village",
  "IFSC (Mayor Street)",
];

export default function CommuteProfileForm() {
  const navigate = useNavigate();
// storing all values entered into the form 
// each input will update the state 
  const [form, setForm] = useState({    //[8]
    FirstName: "",
    Department: "",
    Gender: "",
    WorkHours: "",
    TransportPreference: "",
    MeetupLocation: "",
  });
// updates the correspoding field in form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
// data from form sent to backend using createcommuteprofile()
// sends to the map after user is created 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createCommuteProfile(form);
    alert(res.message || "Commute profile created!");
    navigate("/map");
  };

// fields to fill out the form 
  return (
    <div className="form-wrapper">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Create Commute Profile</h2>

        <label>First Name</label>
        <input name="FirstName" onChange={handleChange} required />

        <label>Department</label>
        <input name="Department" onChange={handleChange} required />

        <label>Gender</label>
        <select name="Gender" onChange={handleChange} required>
          <option value="">Select gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        <label>Work Hours</label>
        <input name="WorkHours" onChange={handleChange} required />

        <label>Transport Preference</label>
        <input name="TransportPreference" onChange={handleChange} required />

        <label>Meetup Location</label>
        <select name="MeetupLocation" onChange={handleChange} required>
          <option value="">Choose a meetup point</option>
          {meetupLocations.map((loc, i) => (
            <option key={i} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <button type="submit">Save Commute Profile</button>
      </form>
    </div>
  );
}
