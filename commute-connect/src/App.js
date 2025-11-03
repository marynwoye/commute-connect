import React, { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser, updateUser } from "./api";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingUser, setEditingUser] = useState(null); // new state

  // Fetch users when app loads
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleAdd = async () => {
    if (!name || !email) {
      alert("Please enter both name and email");
      return;
    }

    if (editingUser) {
      // UPDATE existing user
      await updateUser(editingUser.id, name, email);
      setEditingUser(null);
    } else {
      // CREATE new user
      await createUser(name, email);
    }

    const updated = await getUsers();
    setUsers(updated);
    setName("");
    setEmail("");
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    const updated = await getUsers();
    setUsers(updated);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚗 Commute & Connect</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleAdd}>
          {editingUser ? "Update User" : "Add User"}
        </button>
        {editingUser && (
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setEditingUser(null);
              setName("");
              setEmail("");
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email}){" "}
            <button onClick={() => handleEdit(u)}>✏️ Edit</button>{" "}
            <button onClick={() => handleDelete(u.id)}>❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
