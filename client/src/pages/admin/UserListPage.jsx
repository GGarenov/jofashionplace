import React, { useState, useEffect } from "react";
import axios from "axios";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userInfo")?.token}`,
          },
        });

        console.log("Fetched users:", data); // Log the data to check its structure
        setUsers(data); // Set the fetched data to users state
      } catch (error) {
        setError("Failed to fetch users");
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>User List</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.userName}</td>
                <td>
                  <button>Delete</button>
                  {/* Add actions like edit or delete here */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserListPage;
