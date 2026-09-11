import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function RequireRole({
  allowedRoles,
  allow,
  children,
}) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-400">
        ⏳ جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // دعم الطريقتين القديمة والجديدة
  const roles = allowedRoles || allow || [];

  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}