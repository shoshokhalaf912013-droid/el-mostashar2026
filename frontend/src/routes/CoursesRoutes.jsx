// src/routes/StudentRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import ExamPage from "../pages/Student/ExamPage.jsx";
import ExamResult from "../pages/Student/ExamResult.jsx";
import Videos from "../pages/Student/Videos.jsx";
import StudentDashboard from "../pages/Student/StudentDashboard.jsx";
import StudentLessonFlow from "../pages/Student/StudentLessonFlow.jsx";
import StudentProfile from "../pages/Student/StudentProfile.jsx";
import Homework from "../pages/Student/Homework.jsx";
import HomeworkPage from "../pages/Student/HomeworkPage.jsx";
import TakeExam from "../pages/Student/TakeExam.jsx";
import ReportPage from "../pages/Student/ReportPage.jsx";
import SelectStage from "../pages/Student/SelectStage.jsx"; // ✅ إضافة

export default function StudentRoutes() {
  return (
    <Routes>
      {/* Route افتراضي */}
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="select-stage" element={<SelectStage />} /> {/* ✅ هنا */}
      <Route path="lesson-flow" element={<StudentLessonFlow />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="videos" element={<Videos />} />
      <Route path="exam" element={<ExamPage />} />
      <Route path="exam-result" element={<ExamResult />} />
      <Route path="homework" element={<Homework />} />
      <Route path="homework-page" element={<HomeworkPage />} />
      <Route path="take-exam" element={<TakeExam />} />
      <Route path="report" element={<ReportPage />} />
    </Routes>
  );
}
