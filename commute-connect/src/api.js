// src/api.js
const API_BASE = "http://127.0.0.1:5000";

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function createUser(name, email) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
  return res.json();
}

export async function updateUser(id, name, email) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  return res.json();
}
