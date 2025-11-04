import React, { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "./api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Department: "",
    Gender: "",
    Location: "",
    OfficeAddress: "",
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    getEmployees().then(setEmployees);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.FirstName || !form.LastName || !form.Email) {
      alert("Please fill out First Name, Last Name, and Email");
      return;
    }

    if (editing) {
      await updateEmployee(editing.EmployeeID, form);
    } else {
      await createEmployee(form);
    }

    const updated = await getEmployees();
    setEmployees(updated);
    setForm({
      FirstName: "",
      LastName: "",
      Email: "",
      Department: "",
      Gender: "",
      Location: "",
      OfficeAddress: "",
    });
    setEditing(null);
  };

  const handleEdit = (emp) => {
    setForm(emp);
    setEditing(emp);
  };

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    const updated = await getEmployees();
    setEmployees(updated);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚗 Commute & Connect — Employee Directory</h1>

      <div style={{ marginBottom: "20px" }}>
        {["FirstName", "LastName", "Email", "Department", "Gender", "Location", "OfficeAddress"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            style={{ marginRight: "10px", padding: "5px" }}
          />
        ))}
        <button onClick={handleSubmit}>
          {editing ? "Update Employee" : "Add Employee"}
        </button>
        {editing && (
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setEditing(null);
              setForm({
                FirstName: "",
                LastName: "",
                Email: "",
                Department: "",
                Gender: "",
                Location: "",
                OfficeAddress: "",
              });
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <ul>
        {employees.map((emp) => (
          <li key={emp.EmployeeID}>
            <strong>{emp.FirstName} {emp.LastName}</strong> — {emp.Email} ({emp.Department || "No Dept"})
            <br />
            {emp.Gender && `Gender: ${emp.Gender} | `}
            {emp.Location && `Location: ${emp.Location}`} <br />
            <button onClick={() => handleEdit(emp)}>✏️ Edit</button>{" "}
            <button onClick={() => handleDelete(emp.EmployeeID)}>❌ Delete</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
