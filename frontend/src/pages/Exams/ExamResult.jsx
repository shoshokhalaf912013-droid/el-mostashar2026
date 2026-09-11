import React from "react";
import { useParams } from "react-router-dom";

export default function ExamResult() {
  const { examId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">نتيجة الامتحان</h1>

      <p className="mt-4 text-gray-600">
        عرض نتيجة الامتحان رقم: {examId}
      </p>

      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <p className="text-lg">سيتم هنا عرض تفاصيل الدرجات والإجابات.</p>
      </div>
    </div>
  );
}
