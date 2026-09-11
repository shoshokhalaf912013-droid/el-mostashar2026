// src/components/teacher/TeacherSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function TeacherSidebar() {
  return (
    <aside
      style={{
        width: "240px",
        background: "#0f172a",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        لوحة المعلم
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SidebarLink to="/teacher">🏠 لوحة التحكم</SidebarLink>

        <SidebarLink to="/teacher/lessons">
          📚 دروسي
        </SidebarLink>

        <SidebarLink to="/teacher/lessons/add">
          ➕ إضافة درس
        </SidebarLink>

        <SidebarLink to="/teacher/exams">
          📝 امتحاناتي
        </SidebarLink>

        {/* ⭐ LIVE MANAGEMENT */}
        <SidebarLink to="/teacher/live">
          🎥 إدارة اللايف
        </SidebarLink>

        <SidebarLink to="/profile">
          ⚙️ ملفي الشخصي
        </SidebarLink>
      </nav>
    </aside>
  );
}

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "10px 14px",
        borderRadius: "6px",
        textDecoration: "none",
        color: isActive ? "#000" : "#fff",
        background: isActive ? "#FFD700" : "transparent",
        fontWeight: isActive ? "bold" : "normal",
      })}
    >
      {children}
    </NavLink>
  );
}