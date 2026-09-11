// src/components/Protected/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase();

  if (role === "admin" || role === "superadmin") {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
}
