import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function ExamStart() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);

  const loadExam = async () => {
    const res = await axios.get(`/api/exams/${id}`);
    setExam(res.data.exam);
  };

  useEffect(() => {
    loadExam();
  }, []);

  if (!exam) return <p className="p-6 text-white">جار التحميل...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl text-yellow-400 font-bold">{exam.title}</h1>

      <div className="bg-gray-900 p-6 mt-4 rounded-lg">
        <p>المادة: {exam.subject}</p>
        <p>مدة الامتحان: {exam.duration} دقيقة</p>

        <Link
          to={`/exam/take/${exam._id}`}
          className="bg-blue-600 px-4 py-2 block text-center mt-6 rounded"
        >
          🚀 ابدأ الامتحان
        </Link>
      </div>
    </div>
  );
}
