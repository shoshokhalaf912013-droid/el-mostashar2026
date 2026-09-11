// src/routes/LessonsRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";

import LessonsPage from "../pages/Lessons/LessonsPage.jsx";
import AddLesson from "../pages/Lessons/AddLesson.jsx";
import LessonDetails from "../pages/Lessons/LessonDetails.jsx";
import ExamPage from "../pages/Lessons/ExamPage.jsx";

// استيراد LessonViewer
import LessonViewer from "../pages/Lessons/LessonViewer.jsx";

export default function LessonsRoutes() {
  return (
    <>
      {/* صفحة كل الدروس */}
      <Route index element={<LessonsPage />} />

      {/* إضافة درس */}
      <Route path="add" element={<AddLesson />} />

      {/* عرض الدرس (للمشاهدة) */}
      <Route path="view/:lessonId" element={<LessonViewer />} />

      {/* تفاصيل درس */}
      <Route path=":lessonId" element={<LessonDetails />} />

      {/* الامتحان الخاص بالدرس */}
      <Route path=":lessonId/exam" element={<ExamPage />} />
    </>
  );
}
