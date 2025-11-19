import React, { useState } from "react";
import { loginUser } from "./api";

export default function LoginForm() {
  const [form, setForm] = useState({
    Username: "",
    Password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await loginUser(form);

    if (res.error) {
      alert("Login failed: " + res.error);
    } else {
      alert("Login successful!");
      localStorage.setItem("employeeID", res.EmployeeID);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label>Username</label>
      <input name="Username" onChange={handleChange} required />

      <label>Password</label>
      <input name="Password" type="password" onChange={handleChange} required />

      <button type="submit">Login</button>
    </form>
  );
}
