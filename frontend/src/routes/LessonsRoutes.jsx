import { Routes, Route } from "react-router-dom";

import AddLessonPage from "../pages/Lessons/AddLessonPage.jsx";
import LessonViewer from "../pages/Lessons/LessonViewer.jsx";
import LessonVideo from "../pages/Lessons/LessonVideo.jsx";
import ExamPage from "../pages/Lessons/ExamPage.jsx";
import LessonManager from "../pages/Lessons/LessonManager.jsx";
import ExamManage from "../pages/Lessons/ExamManage.jsx";

import RequireRole from "../components/shared/RequireRole";

export default function LessonsRoutes() {
  return (
    <Routes>
      <Route
        path="manage"
        element={
          <RequireRole allowedRoles={["teacher", "admin", "super-admin"]}>
            <LessonManager />
          </RequireRole>
        }
      />

      <Route
        path="add"
        element={
          <RequireRole allowedRoles={["teacher", "admin", "super-admin"]}>
            <AddLessonPage />
          </RequireRole>
        }
      />

      <Route
        path="view/:id"
        element={
          <RequireRole allowedRoles={["teacher", "admin", "super-admin"]}>
            <LessonViewer />
          </RequireRole>
        }
      />

      <Route
        path="video/:id"
        element={
          <RequireRole allowedRoles={["teacher", "admin", "super-admin"]}>
            <LessonVideo />
          </RequireRole>
        }
      />

      <Route
        path="exam/:id"
        element={
          <RequireRole allowedRoles={["teacher", "admin", "super-admin"]}>
            <ExamPage />
          </RequireRole>
        }
      />

      <Route
        path="exam/:id/manage"
        element={
          <RequireRole allowedRoles={["teacher", "admin", "super-admin"]}>
            <ExamManage />
          </RequireRole>
        }
      />
    </Routes>
  );
}
