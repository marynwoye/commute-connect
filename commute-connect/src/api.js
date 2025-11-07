// api.js // This file handles communication between react frontend n flask backend
// sends and receives data using HTTP requests //
// Stack Overflow post using fetch with Json https://stackoverflow.com/questions/29775797/fetch-post-json-data
const API_BASE = "http://127.0.0.1:5000";  // where my flask app runs locally atm 

// get all employees asks flask for a list of all employees in the database
export async function getEmployees() {
  const res = await fetch(`${API_BASE}/employees`);  // send GET request to employees
  return res.json(); // convert response from JSON to javascript object
}

export async function createEmployee(employee) {  // sends the form data from React to Flask to add a new employee
  const res = await fetch(`${API_BASE}/employees`, {
    method: "POST", // HTTP method for creating new data
    headers: { "Content-Type": "application/json" }, // telling Flask sending JSON data
    body: JSON.stringify(employee),  // send updated employee data
  });
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_BASE}/employees/${id}`, { method: "DELETE" });
  return res.json();  // Get Flasks response as JSON
}

export async function updateEmployee(id, employee) {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
  return res.json();
}
