// src/routes/ExamsRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AddQuestionPage from "../pages/Exams/AddQuestionPage.jsx";
import ExamList from "../pages/Exams/ExamList.jsx";
import ExamResult from "../pages/Exams/ExamResult.jsx";
import ExamsManager from "../pages/Exams/ExamsManager.jsx";
import StartExam from "../pages/Exams/StartExam.jsx";

export default function ExamsRoutes() {
  return (
    <Routes>
      <Route path="" element={<ExamList />} />
      <Route path="start/:id" element={<StartExam />} />
      <Route path="result/:id" element={<ExamResult />} />
      <Route path="manager" element={<ExamsManager />} />
      <Route path="add-question" element={<AddQuestionPage />} />
    </Routes>
  );
}
