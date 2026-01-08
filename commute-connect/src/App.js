import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import CommuteProfileForm from "./CommuteProfileForm";
import LoginForm from "./LoginForm";
import MapSelector from "./MapSelector";
import { getCommuteProfiles } from "./api";
import CommuteGroupsPage from "./CommuteGroupsPage";
import CreateGroupPage from "./CreateGroupPage";

import "./ui.css"; // ✅ navbar styles live here

// ✅ Map page component
function MapPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCommuteProfiles();
      setProfiles(data);
    };
    load();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h3>Map Below</h3>
      <MapSelector commuteProfiles={profiles} />
    </div>
  );
}

// ✅ A wrapper to protect routes (only allow if logged in)
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ✅ Login route wrapper so we can redirect after login
function LoginRoute({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    onLogin(userData);
    navigate("/map");
  };

  return <LoginForm onLogin={handleLogin} />;
}

/* ✅ Navbar component (hamburger + closes on route change) */
function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when navigating to another page
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          🚗 Commute & Connect
        </Link>

        {/* Desktop links */}
        <nav className="navbar-links">
          <Link to="/" className="navlink">Home</Link>
          <Link to="/create-profile" className="navlink">Create Profile</Link>
          <Link to="/map" className="navlink">Map</Link>
          <Link to="/groups" className="navlink">Groups</Link>
          <Link to="/create-group" className="navlink">Create Group</Link>

          {!user ? (
            <Link to="/login" className="navlink">Login</Link>
          ) : (
            <>
              <span className="nav-user">
                Welcome {user.FirstName} {user.LastName}
              </span>
              <button className="nav-btn" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen((v) => !v)}>
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="navlink">Home</Link>
        <Link to="/create-profile" className="navlink">Create Profile</Link>
        <Link to="/map" className="navlink">Map</Link>
        <Link to="/groups" className="navlink">Groups</Link>
        <Link to="/create-group" className="navlink">Create Group</Link>

        {!user ? (
          <Link to="/login" className="navlink">Login</Link>
        ) : (
          <div className="mobile-actions">
            <span className="nav-user" style={{ flex: 1 }}>
              {user.FirstName} {user.LastName}
            </span>
            <button className="nav-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ Keep user logged in after refresh
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<h1 style={{ paddingTop: 120, paddingLeft: 20 }}>Welcome to Commute & Connect</h1>} />

        <Route path="/login" element={<LoginRoute onLogin={handleLogin} />} />

        <Route
          path="/create-profile"
          element={
            <ProtectedRoute user={user}>
              <CommuteProfileForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute user={user}>
              <MapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute user={user}>
              <CommuteGroupsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-group"
          element={
            <ProtectedRoute user={user}>
              <CreateGroupPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
