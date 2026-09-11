import React, { useState } from "react";

const ManageUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Ahmed Ali", email: "ahmed@example.com", role: "student" },
    { id: 2, name: "Sara Mohamed", email: "sara@example.com", role: "teacher" },
  ]);

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>إدارة المستخدمين</h2>

      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#eee",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>الاسم</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>الإيميل</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>الدور</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>إجراءات</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{u.name}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{u.email}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{u.role}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <button
                  onClick={() => handleDelete(u.id)}
                  style={{
                    background: "red",
                    color: "white",
                    padding: "6px 12px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
