import {
  Routes,
  Route,
} from "react-router-dom";

import SuperAdminLayout
  from "../layouts/SuperAdminLayout";

import SuperAdminHome
  from "../pages/superadmin/SuperAdminHome";

import AddTeacher
  from "../pages/superadmin/AddTeacher";

import EditTeacher
  from "../pages/superadmin/EditTeacher";

import ManageTeachers
  from "../pages/superadmin/ManageTeachers";

import UsersManagement
  from "../pages/superadmin/UsersManagement";

import StudentsManagement
  from "../pages/superadmin/StudentsManagement";

import ManageExams
  from "../pages/superadmin/ManageExams";

import SuperStatistics
  from "../pages/superadmin/SuperStatistics";

import UnitsViewSuperAdmin
  from "../pages/superadmin/UnitsViewSuperAdmin";

import AddLesson
  from "../pages/superadmin/AddLesson";

import SecureRoleControl
  from "../pages/superadmin/SecureRoleControl";

import CriticalPermissions
  from "../pages/superadmin/CriticalPermissions";

import SuperAdminNotFound
  from "../pages/superadmin/SuperAdminNotFound";

import TestPermissions
  from "../pages/superadmin/TestPermissions";

import VideoSecrets
  from "../pages/superadmin/VideoSecrets";

import LessonsManagement
  from "../pages/superadmin/LessonsManagement";

import RequireRole
  from "../components/shared/RequireRole";

/*
========================================================
QUESTION BANK
========================================================
*/

import QuestionBank
  from "../pages/superadmin/QuestionBank";

/*
========================================================
EXAM ENGINE
========================================================
*/

import ExamBuilder
  from "../pages/teacher/ExamBuilder";

/*
========================================================
EXAM FILE IMPORT
========================================================
*/

import ExamImport
  from "../pages/superadmin/ExamImport";


export default function SuperAdminRoutes() {

  return (

    <Routes>

      {/* =================================================
          SUPER ADMIN AREA
      ================================================= */}

      <Route
        element={
          <RequireRole
            allowedRoles={[
              "super-admin",
            ]}
          >
            <SuperAdminLayout />
          </RequireRole>
        }
      >

        {/* =========================
            DASHBOARD
        ========================= */}

        <Route
          index
          element={
            <SuperAdminHome />
          }
        />

        <Route
          path="dashboard"
          element={
            <SuperAdminHome />
          }
        />


        {/* =========================
            TEACHERS
        ========================= */}

        <Route
          path="add-teacher"
          element={
            <AddTeacher />
          }
        />

        <Route
          path="edit-teacher/:id"
          element={
            <EditTeacher />
          }
        />

        <Route
          path="manage-teachers"
          element={
            <ManageTeachers />
          }
        />


        {/* =========================
            USERS
        ========================= */}

        <Route
          path="users"
          element={
            <UsersManagement />
          }
        />

        <Route
          path="students"
          element={
            <StudentsManagement />
          }
        />


        {/* =========================
            EXAMS
        ========================= */}

        <Route
          path="add-exam"
          element={
            <ExamBuilder />
          }
        />

        <Route
          path="manage-exams"
          element={
            <ManageExams />
          }
        />


        {/* =========================
            IMPORT EXAM FROM FILES
        ========================= */}

        <Route
          path="import-exam"
          element={
            <ExamImport />
          }
        />


        {/* =========================
            QUESTION BANK
        ========================= */}

        <Route
          path="question-bank"
          element={
            <QuestionBank />
          }
        />


        {/* =========================
            STATISTICS
        ========================= */}

        <Route
          path="statistics"
          element={
            <SuperStatistics />
          }
        />


        {/* =========================
            UNITS
        ========================= */}

        <Route
          path="units/:systemId/:gradeId/:subjectId"
          element={
            <UnitsViewSuperAdmin />
          }
        />


        {/* =========================
            LESSONS MANAGEMENT
            SUPER ADMIN
        ========================= */}

        <Route
          path="lessons-management"
          element={
            <LessonsManagement />
          }
        />


        {/* =========================
            ADD LESSON
        ========================= */}

        <Route
          path="add-lesson/:systemId/:gradeId/:subjectId/:unitId"
          element={
            <RequireRole
              allowedRoles={[
                "super-admin",
                "admin",
                "teacher",
              ]}
            >
              <AddLesson />
            </RequireRole>
          }
        />


        {/* =================================================
            VIDEO SECRETS
            SUPER ADMIN ONLY
        ================================================= */}

        <Route
          path="video-secrets"
          element={
            <VideoSecrets />
          }
        />


        {/* =========================
            TEST PERMISSIONS
        ========================= */}

        <Route
          path="__test-permissions"
          element={
            <TestPermissions />
          }
        />


        {/* =========================
            SECURE
        ========================= */}

        <Route
          path="__secure-control"
          element={
            <SecureRoleControl />
          }
        />

        <Route
          path="__critical"
          element={
            <CriticalPermissions />
          }
        />


        {/* =========================
            NOT FOUND
        ========================= */}

        <Route
          path="*"
          element={
            <SuperAdminNotFound />
          }
        />

      </Route>

    </Routes>
  );
}