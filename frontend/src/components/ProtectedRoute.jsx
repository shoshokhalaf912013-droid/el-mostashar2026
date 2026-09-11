import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const normalizeRole = (role) => {
  if (!role) return "";
  return role.toLowerCase().replace(/[-_]/g, "");
};

export default function ProtectedRoute({ children, roles = [] }) {

  const { user, role, loading } = useAuth();

  /* انتظار Firebase */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-400 text-xl">
        ⏳ جاري التحقق من تسجيل الدخول...
      </div>
    );
  }

  /* غير مسجل */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* تحقق الصلاحيات */
  if (roles.length) {

    const normalizedUserRole = normalizeRole(role);
    const normalizedAllowedRoles = roles.map(normalizeRole);

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}