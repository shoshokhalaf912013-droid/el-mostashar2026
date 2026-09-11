// frontend/src/routes/AdminRoutes.jsx

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout.jsx";

import AdminDashboard from "../pages/Admin/AdminDashboard.jsx";

import Reports from "../pages/Admin/Reports.jsx";

import StudentReports from "../pages/Admin/StudentReports.jsx";

import StudentReportDetails from "../pages/Admin/StudentReportDetails.jsx";

import ExamBuilder from "../pages/teacher/ExamBuilder.jsx";

import AddLesson from "../pages/Admin/AddLesson.jsx";
import AddQuestion from "../pages/Admin/AddQuestion.jsx";
import AddExam from "../pages/Admin/AddExam.jsx";

import AdminSubjectBuilder from "../pages/Admin/AdminSubjectBuilder.jsx";
import AdminLessonsManager from "../pages/Admin/AdminLessonsManager.jsx";

import RequireRole from "../components/shared/RequireRole";

export default function AdminRoutes() {
  return (
    <Routes>

      {/* =================================================
          ADMIN AREA
      ================================================= */}

      <Route
        element={
          <RequireRole
            allowedRoles={[
              "admin",
              "super-admin",
            ]}
          >
            <AdminLayout />
          </RequireRole>
        }
      >

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          index
          element={
            <AdminDashboard />
          }
        />

        <Route
          path="dashboard"
          element={
            <Navigate
              to="/admin"
              replace
            />
          }
        />


        {/* =================================================
            REPORTS
        ================================================= */}

        {/* التقرير العام */}

        <Route
          path="reports"
          element={
            <Reports />
          }
        />


        {/* =================================================
            STUDENT REPORTS
        ================================================= */}

        {/* قائمة الطلاب */}

        <Route
          path="student-reports"
          element={
            <StudentReports />
          }
        />

        {/* التقرير التفصيلي لطالب */}

        <Route
          path="student-reports/:userId"
          element={
            <StudentReportDetails />
          }
        />


        {/* =================================================
            EXAMS
        ================================================= */}

        {/* نفس محرك الامتحانات */}

        <Route
          path="add-exam"
          element={
            <ExamBuilder />
          }
        />


        {/* =================================================
            QUESTIONS
        ================================================= */}

        <Route
          path="add-question"
          element={
            <AddQuestion />
          }
        />

        <Route
          path="add-question/:examId"
          element={
            <AddQuestion />
          }
        />

        <Route
          path="exams/:examId/questions"
          element={
            <AddQuestion />
          }
        />


        {/* =================================================
            LESSONS
        ================================================= */}

        <Route
          path="add-lesson"
          element={
            <AddLesson />
          }
        />


        {/* =================================================
            LESSON MANAGER
        ================================================= */}

        <Route
          path="lessons-manager"
          element={
            <AdminLessonsManager />
          }
        />


        {/* =================================================
            SUBJECT BUILDER
        ================================================= */}

        <Route
          path="subjects-builder"
          element={
            <AdminSubjectBuilder />
          }
        />

        <Route
          path="subjects/:gradeId/:subjectKey"
          element={
            <AdminSubjectBuilder />
          }
        />

      </Route>

    </Routes>
  );
}