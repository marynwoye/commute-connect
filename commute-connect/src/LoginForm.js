import React, { useState } from "react";
import { loginUser } from "./api";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({
    Username: "",
    Password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ call new loginUser function correctly
      const user = await loginUser(form.Username, form.Password);

      // ✅ tell App.js that login succeeded
      onLogin(user);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚗 Commute & Connect</h1>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: "350px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Username</label>
          <input
            name="Username"
            value={form.Username}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Password</label>
          <input
            name="Password"
            type="password"
            value={form.Password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button type="submit" style={{ padding: "10px", width: "100%" }}>
          Login
        </button>

        {error && <p style={{ marginTop: "10px" }}>{error}</p>}
      </form>
    </div>
  );
}
