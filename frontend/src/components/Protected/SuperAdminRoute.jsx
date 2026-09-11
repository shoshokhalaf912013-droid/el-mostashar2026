// src/components/Protected/SuperAdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * SuperAdminRoute checks localStorage "user" first (fast),
 * then falls back to denying access.
 *
 * Expects `user` saved like:
 * { uid, email, role, isSuperAdmin }
 */
export default function SuperAdminRoute() {
  const saved = localStorage.getItem("user");

  if (!saved) return <Navigate to="/login" replace />;

  let user = null;
  try {
    user = JSON.parse(saved);
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || "").toString().toLowerCase();
  const isSuper = !!user.isSuperAdmin || ["superadmin", "super-admin", "super_admin"].includes(role);

  if (!isSuper) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
