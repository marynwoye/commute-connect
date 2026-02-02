
// This file handles communication between react frontend n flask backend
// sends and receives data using HTTP requests
// Stack Overflow post using fetch with Json https://stackoverflow.com/questions/29775797/fetch-post-json-data [6]

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000"; // Vercel uses env var, local uses localhost
 // where my flask app runs locally atm

// get all employees asks flask for a list of all employees in the database
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

// =====================
// Commute profile API
// =====================

export async function createCommuteProfile(profile) {
  console.log("Calling POST /commute-profile");
  console.log("URL:", `${API_BASE}/commute-profile`);
  console.log("Sending profile:", profile);

  const res = await fetch(`${API_BASE}/commute-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  console.log("Raw response:", res);

  const data = await res.json();
  console.log("Response data:", data);

  return data;
}

export async function getCommuteProfiles() {
  const res = await fetch(`${API_BASE}/commute-profile`);
  return res.json();
}

// =====================
// Login API (plain text password MVP)
// =====================

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Username: username, Password: password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data; // { EmployeeID, FirstName, LastName }
}

// =====================
// Commute groups API (with filtering)
// =====================

/**
 * Fetch commute groups with optional filters.
 * type: "carpool" | "walk" | "luas"
 * filters: { gender?: string, department?: string, location?: string }
 */
export async function getCommuteGroups(type, filters = {}) {
  const params = new URLSearchParams();

  if (type) params.append("type", type);

  if (filters.gender) params.append("gender", filters.gender);
  if (filters.department) params.append("department", filters.department);
  if (filters.location) params.append("location", filters.location);

  const url = `${API_BASE}/commute-groups?${params.toString()}`;
  const res = await fetch(url);
  return res.json();
}

export async function getGroupMembers(groupId) {
  const res = await fetch(`${API_BASE}/commute-groups/${groupId}/members`);
  return res.json();
}

export async function joinGroup(groupId, employeeId) {
  const res = await fetch(`${API_BASE}/commute-groups/${groupId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ EmployeeID: employeeId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Join failed");
  }
  return data;
}

export async function createCommuteGroup(group) {
  const res = await fetch(`${API_BASE}/commute-groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Create group failed");
  }

  return data; // { message, GroupID }
}

export async function leaveGroup(groupId, employeeId) {
  const res = await fetch(
    `${API_BASE}/commute-groups/${groupId}/leave?employeeId=${encodeURIComponent(employeeId)}`,
    { method: "DELETE" }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Leave failed");
  }

  return data;
}
