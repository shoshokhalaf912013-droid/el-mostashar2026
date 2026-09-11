// src/components/teacher/TeacherLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Content */}
      <main
        style={{
          flex: 1,
          background: "#020617",
          color: "#fff",
          padding: "30px",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
