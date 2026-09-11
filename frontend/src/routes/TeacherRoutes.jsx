// src/routes/TeacherRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import TeacherLayout from "../components/teacher/TeacherLayout";

import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherLessons from "../pages/teacher/TeacherLessons";
import TeacherExams from "../pages/teacher/TeacherExams";
import AddLesson from "../pages/teacher/AddLesson";

/*
========================================================
LESSON PLAYER

نستخدم نفس LessonPlayer الموجود فعليًا في المنصة
مع الحفاظ على بنية:

gradeId
subjectId
unitId
lessonId
========================================================
*/

import LessonPlayer from "../pages/Student/LessonPlayer";

/*
========================================================
EXAM ENGINE

المحرك الموحد للامتحانات

يستخدمه:
Teacher
Admin
Super Admin

يدعم:
1. إنشاء امتحان عام
2. إنشاء امتحان مرتبط بدرس
3. تعديل امتحان
========================================================
*/

import ExamBuilder from "../pages/teacher/ExamBuilder";

/* =========================
   LIVE SYSTEM
========================= */

import TeacherLiveRoom from "../features/liveClass/TeacherLiveRoom";
import TeacherLiveRoomWrapper from "../features/liveClass/TeacherLiveRoomWrapper";

export default function TeacherRoutes() {
  const { role, loading } = useAuth();

  /* =========================
     انتظار تحميل الصلاحيات
  ========================= */

  if (loading || !role) {
    return (
      <div
        style={{
          padding: 40,
          color: "#fff",
          background: "#000",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  /* =========================
     الصلاحيات
  ========================= */

  const allowedRoles = [
    "teacher",
    "admin",
    "super-admin",
  ];

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================
     ROUTES
  ========================= */

  return (
    <Routes>

      <Route
        element={<TeacherLayout />}
      >

        {/* =========================
            DASHBOARD
        ========================= */}

        <Route
          index
          element={<TeacherDashboard />}
        />

        {/* =========================
            LESSONS
        ========================= */}

        <Route
          path="lessons"
          element={<TeacherLessons />}
        />

        {/* =========================
            ADD LESSON
        ========================= */}

        <Route
          path="lessons/add"
          element={<AddLesson />}
        />

        {/* =================================================
            LESSON BUILDER / LESSON MANAGEMENT

            نفس LessonPlayer الموجود فعليًا في المنصة

            المسار:
            /teacher/lesson-builder/:gradeId/:subjectId/:unitId/:lessonId

            يستخدم:
            gradeId
            subjectId
            unitId
            lessonId
        ================================================= */}

        <Route
          path="lesson-builder/:gradeId/:subjectId/:unitId/:lessonId"
          element={<LessonPlayer />}
        />

        {/* =========================
            EXAMS
        ========================= */}

        {/* قائمة امتحانات المعلم */}

        <Route
          path="exams"
          element={<TeacherExams />}
        />

        {/* ------------------------------------------------
           إنشاء امتحان عام

           /teacher/exams/add

           لا يوجد ارتباط إجباري بدرس
        ------------------------------------------------ */}

        <Route
          path="exams/add"
          element={<ExamBuilder />}
        />

        {/* ------------------------------------------------
           إنشاء امتحان خاص بالدرس

           هذا هو المسار الذي يستخدمه LessonPlayer

           /teacher/exam-builder/:gradeId/:subjectId/:unitId/:lessonId
        ------------------------------------------------ */}

        <Route
          path="exam-builder/:gradeId/:subjectId/:unitId/:lessonId"
          element={<ExamBuilder />}
        />

        {/* ------------------------------------------------
           تعديل امتحان خاص بالدرس

           نحافظ عليه الآن كمدخل للـExamBuilder
           إلى أن نربطه بالـexamId الفعلي.
        ------------------------------------------------ */}

        <Route
          path="exam-edit/:gradeId/:subjectId/:unitId/:lessonId"
          element={<ExamBuilder />}
        />

        {/* ------------------------------------------------
           معاينة امتحان خاص بالدرس

           مؤقتًا نوجهه إلى ExamBuilder
           حتى لا نترك Route غير موجود.
        ------------------------------------------------ */}

        <Route
          path="exam-preview/:gradeId/:subjectId/:unitId/:lessonId"
          element={<ExamBuilder />}
        />

        {/* =========================
            LIVE
        ========================= */}

        <Route
          path="live"
          element={<TeacherLiveRoom />}
        />

        {/* =========================
            LIVE BY LESSON
        ========================= */}

        <Route
          path="live/:lessonId"
          element={<TeacherLiveRoomWrapper />}
        />

      </Route>

    </Routes>
  );
}