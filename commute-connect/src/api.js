// src/api.js
const API_BASE = "http://127.0.0.1:5000";

export async function getEmployees() {
  const res = await fetch(`${API_BASE}/employees`);
  return res.json();
}

export async function createEmployee(employee) {
  const res = await fetch(`${API_BASE}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_BASE}/employees/${id}`, { method: "DELETE" });
  return res.json();
}

export async function updateEmployee(id, employee) {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
  return res.json();
}
