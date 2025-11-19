// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import CommuteProfileForm from "./CommuteProfileForm";
import LoginForm from "./LoginForm";
import MapSelector from "./MapSelector";

import { useState, useEffect } from "react";
import { getCommuteProfiles } from "./api";

// --------------------------------------------------
// MAP PAGE – loads commute profiles every time
// --------------------------------------------------
function MapPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCommuteProfiles();
      setProfiles(data);
    };
    load(); // 🔥 Always reload when visiting /map
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚗 Commute & Connect</h1>
      <h3>Meetup locations & Deloitte offices shown below</h3>
      <MapSelector commuteProfiles={profiles} />
    </div>
  );
}

// --------------------------------------------------
// MAIN APP ROUTER
// --------------------------------------------------
export default function App() {
  return (
    <Router>
      {/* Navigation Bar */}
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
