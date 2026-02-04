import React, { useState } from "react";
import { loginUser } from "./api";
import "./ui.css";
import "./LoginPage.css";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ Username: "", Password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await loginUser(form.Username, form.Password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-container login-container">
        <div className="login-brand">
          <span className="login-emoji">🚗</span>
          <span className="login-brand-text">Commute &amp; Connect</span>
        </div>

        <div className="login-card">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Sign in to access your commute tools.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="login-label">Username</label>
              <input
                className="login-input"
                name="Username"
                value={form.Username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="login-label">Password</label>
              <input
                className="login-input"
                name="Password"
                type="password"
                value={form.Password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            {error && <p className="login-error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}