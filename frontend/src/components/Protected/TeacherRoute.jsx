import { Route, Outlet } from "react-router-dom";
import TeacherDashboard from "../pages/teacher/TeacherDashboard.jsx";

export default function TeacherRoutes() {
  return <Outlet />;
}

export const teacherChildren = (
  <>
    <Route path="dashboard" element={<TeacherDashboard />} />
  </>
);
