// control navigation between pages
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; //[React Router 9]

import CommuteProfileForm from "./CommuteProfileForm";
import LoginForm from "./LoginForm";
import MapSelector from "./MapSelector";

import { useState, useEffect } from "react";
import { getCommuteProfiles } from "./api";


// map page component
// it is retriving all commute profile form the backend end 
// so employye meet up pins can be displayed on the map

function MapPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const load = async () => {  // loading profile from the backend
      const data = await getCommuteProfiles();
      setProfiles(data);
    };
    load(); // ensuring the map refreshes everytime a user opens the map
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚗 Commute & Connect</h1>
      <h3>Map Below</h3>
      <MapSelector commuteProfiles={profiles} />
    </div>
  );
}


// using react router to control different pages in the system
// navigation bar and routes 
export default function App() {
  return (
    <Router>
      {/* navigation bar */}
      <nav style={{ padding: "15px", background: "#f0f0f0", marginBottom: "20px" }}>
        <Link to="/" style={{ marginRight: "20px" }}>Home</Link>
        <Link to="/login" style={{ marginRight: "20px" }}>Login</Link>
        <Link to="/create-profile" style={{ marginRight: "20px" }}>Create Profile</Link>
        <Link to="/map">Map</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Welcome to Commute & Connect</h1>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/create-profile" element={<CommuteProfileForm />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}
