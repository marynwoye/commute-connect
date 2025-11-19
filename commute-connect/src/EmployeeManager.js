// EmployeeManager.js // 
// This file handles everything related to employee data
// it shows a form to add or edit employees view or delete (CRUD functionalites)
//It connects to the flask backend and MYSQL databse but is not currently part of the main Ui
// Developed for enviroment Setup 
//Map.Selector.js is the main visible componet in Iteration1
import React, { useState, useEffect } from "react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "./api"; // importing the functions that will talk to my flask backend
// main EmployeeManager Component
export default function EmployeeManager() {   // Employees list of all employees 
  const [employees, setEmployees] = useState([]); // setEmployees - updates that list when it changes 
  const [form, setForm] = useState({  // form - stores what the user types into the input boxes
    FirstName: "",  // each key is matching with my database column names in MySQL
    LastName: "",
    Email: "",
    Department: "",
    Gender: "",
    Location: "",
    OfficeAddress: "",
  });
  const [editing, setEditing] = useState(null);// editing - stores the employees thats currently being edited if there is any

  useEffect(() => {    // useEffect - runs when the component loads it gets the list of employee from the backend
    getEmployees().then(setEmployees);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });  // updates the form as user type in input boxes

  const handleSubmit = async () => {  // handleSubmit runs when you select add or update button
    if (!form.FirstName || !form.LastName || !form.Email) {   // make sure required fields are filled in
      alert("Please fill out First Name, Last Name, and Email");
      return;
    }

    if (editing) await updateEmployee(editing.EmployeeID, form);  // if editing is true update an employee
    else await createEmployee(form);  // otherwise create a new one 

    setEmployees(await getEmployees());  // refresh the employee list after adding/editing
    setForm({  // clears the form after a user submits
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

  const handleEdit = (emp) => { // when a user clicks edit, this is filling the form with that employee, tells program 
    setForm(emp);               // that it is editing instead of adding a new employee
    setEditing(emp);
  };

  const handleDelete = async (id) => {  // handle delete - deletes an employee ID 
    await deleteEmployee(id);
    setEmployees(await getEmployees());  // refresh list 
  };
// The actual layout, what is seen on the screen // this is the for the CRUD functionality that works but is hidden from main page as it is not relvant to the user story I developed  
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Employee Management</h2>

      <div>
        {["FirstName", "LastName", "Email", "Department", "Gender", "Location", "OfficeAddress"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            style={{ margin: "5px", padding: "5px" }}
          />
        ))}
        <button onClick={handleSubmit}>{editing ? "Update" : "Add"} Employee</button>
      </div>

      <ul>
        {employees.map((emp) => (
          <li key={emp.EmployeeID}>
            <strong>{emp.FirstName} {emp.LastName}</strong> — {emp.Email}
            <br />
            {emp.Department && `Dept: ${emp.Department}`}{" "}
            {emp.Gender && ` | Gender: ${emp.Gender}`}
            <br />
            {emp.Location && `📍 ${emp.Location}`}
            <br />
            <button onClick={() => handleEdit(emp)}>✏️ Edit</button>{" "}
            <button onClick={() => handleDelete(emp.EmployeeID)}>❌ Delete</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
