 import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function ExamResult() {
  const location = useLocation();
  const { score, total } = location.state || { score: 0, total: 1 };

  return (
    <div className="p-6 text-white text-center">
      <h1 className="text-3xl text-yellow-400 font-bold mb-4">
        نتيجتك في الامتحان
      </h1>

      <div className="bg-gray-900 p-6 rounded-lg">
        <p className="text-xl">الدرجة: {score} من {total}</p>

        <Link
          to="/exam"
          className="bg-blue-600 px-4 py-2 block mt-4 rounded"
        >
          الرجوع للامتحانات
        </Link>
      </div>
    </div>
  );
}
