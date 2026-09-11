import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentRoute() {
  const { role, user } = useAuth();

  if (!user || role === null || role === undefined) {
    return null;
  }

  if (role === "student") {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
}
