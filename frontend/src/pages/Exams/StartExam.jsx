// src/pages/Student/StartExam.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function StartExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const load = async () => {
      try {
        // backend expected route: /api/student/exams/start/:id
        const res = await api.get(`/api/student/exams/start/${id}`);
        setExam(res.data.exam);
      } catch (err) {
        console.error("فشل تحميل الامتحان:", err);
        alert("فشل تحميل الامتحان");
      }
    };
    load();
  }, [id]);

  const start = async () => {
    try {
      // نرسل userId الحقيقي (backend يجب أن يستعمل auth في واقع الإنتاج)
      const res = await api.post("/api/attempts/start", { examId: id, userId: user?.uid || null });
      const attemptId = res.data.attemptId || res.data.attempt?._id;
      if (!attemptId) throw new Error("attempt id missing");
      navigate(`/exam/take/${attemptId}`);
    } catch (err) {
      console.error("فشل بدء الامتحان:", err);
      alert("فشل بدء الامتحان");
    }
  };

  if (!exam) return <div className="p-6 text-white">جاري التحميل...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl text-yellow-400">{exam.title}</h1>
      <p>المادة: {exam.subject}</p>
      <p>المدة: {exam.duration || exam.durationMinutes} دقيقة</p>
      <p>نوع الامتحان: {exam.strictMode ? "صارم (هدايا)" : "عادي"}</p>
      <button onClick={start} className="mt-4 bg-green-600 p-2 rounded">ابدأ الامتحان</button>
    </div>
  );
}
