import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExams = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/exams");

      setExams(res.data.exams || []);
    } catch (err) {
      console.error("Error loading exams:", err);
      setError("تعذر تحميل الامتحانات حاليًا.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl text-yellow-400 font-bold mb-4">
        الامتحانات المتاحة 🎓
      </h1>

      {loading && (
        <p className="text-gray-400">
          جاري تحميل الامتحانات...
        </p>
      )}

      {!loading && error && (
        <div className="bg-red-900/50 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && exams.length === 0 && (
        <div className="bg-gray-900 p-4 rounded-lg text-gray-400">
          لا توجد امتحانات متاحة حاليًا.
        </div>
      )}

      {!loading && !error && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="bg-gray-900 p-4 rounded-lg flex justify-between"
            >
              <div>
                <h2 className="text-xl font-bold">
                  {exam.title}
                </h2>

                <p className="text-gray-400">
                  {exam.subject}
                </p>

                <p>
                  مدة الامتحان: {exam.duration} دقيقة
                </p>

                {typeof exam.questionsCount === "number" && (
                  <p className="text-gray-400">
                    عدد الأسئلة: {exam.questionsCount}
                  </p>
                )}
              </div>

              <Link
                to={`/exam/start/${exam._id}`}
                className="bg-green-600 px-4 py-2 rounded h-fit"
              >
                دخول
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}