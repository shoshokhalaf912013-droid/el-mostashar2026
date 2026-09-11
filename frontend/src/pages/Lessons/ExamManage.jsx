import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ExamManage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-8" dir="rtl">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4 text-center">
        كويز هذا الدرس
      </h1>

      <p className="text-center text-gray-400 mb-10">
        أنت الآن داخل صفحة إدارة الكويز المرتبط بهذا الدرس
      </p>

      {/* ===== كارت معلومات الكويز (Placeholder) ===== */}
      <div className="max-w-xl mx-auto bg-[#111] border border-gray-700 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-bold mb-4 text-blue-400">
          معلومات الكويز
        </h2>

        <ul className="space-y-2 text-sm text-gray-300">
          <li>
            <span className="text-gray-400">رقم الكويز:</span>{" "}
            {examId || "—"}
          </li>
          <li>
            <span className="text-gray-400">الحالة:</span>{" "}
            مسودة (Draft)
          </li>
          <li>
            <span className="text-gray-400">عدد الأسئلة:</span>{" "}
            — (سيتم إضافته لاحقًا)
          </li>
          <li>
            <span className="text-gray-400">مدة الامتحان:</span>{" "}
            — (سيتم تحديدها لاحقًا)
          </li>
        </ul>
      </div>

      {/* ===== أزرار الإدارة ===== */}
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {/* إدارة الأسئلة */}
        <button
          onClick={() =>
            navigate(`/lessons/exam/${examId}/questions`)
          }
          className="px-6 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition"
        >
          🧩 إدارة أسئلة هذا الكويز
        </button>

        {/* معاينة الامتحان (طالب) */}
        <button
          onClick={() =>
            navigate(`/lessons/exam/${examId}`)
          }
          className="px-6 py-3 bg-yellow-500 rounded-xl text-black font-bold hover:bg-yellow-600 transition"
        >
          👁️ معاينة الامتحان (عرض الطالب)
        </button>
      </div>

      {/* ===== تنبيه توضيحي ===== */}
      <div className="max-w-xl mx-auto mt-12 bg-[#111] border border-yellow-600 rounded-xl p-4 text-sm text-yellow-400">
        ⚠️ هذه الصفحة مخصّصة لإدارة الكويز فقط.
        <br />
        لا يمكن للطلاب الوصول إليها.
        <br />
        سيتم استكمال الإعدادات والأسئلة في المراحل القادمة.
      </div>
    </div>
  );
}
