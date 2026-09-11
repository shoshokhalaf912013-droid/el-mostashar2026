import { Navigate } from "react-router-dom";

export default function RequireSecondaryTrack({ children }) {
  const track = localStorage.getItem("secondaryTrack");

  if (!track) {
    return <Navigate to="/student/secondary/select-track/sec3" replace />;
  }

  return children;
}
