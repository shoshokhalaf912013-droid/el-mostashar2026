// src/pages/teacher/TeacherExams.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherExams() {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-950 text-white p-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* =========================
            العنوان
        ========================= */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">
            📝 إدارة الاختبارات
          </h1>

          <p className="text-gray-400 mt-2">
            إنشاء وإدارة الاختبارات الخاصة بالدروس والمواد.
          </p>
        </div>

        {/* =========================
            إضافة امتحان
        ========================= */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                إضافة اختبار جديد
              </h2>

              <p className="text-gray-400">
                أنشئ اختبارًا جديدًا وحدد المرحلة والصف والمادة والوحدة والدرس والأسئلة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/teacher/exams/add")}
              className="
                w-full md:w-auto
                bg-gradient-to-r from-yellow-400 to-yellow-600
                hover:from-yellow-300 hover:to-yellow-500
                text-black
                px-7
                py-3
                rounded-xl
                font-bold
                text-lg
                shadow-lg
                transition
                whitespace-nowrap
              "
            >
              ➕ إضافة امتحان جديد
            </button>

          </div>
        </div>

        {/* =========================
            الاختبارات الحالية
        ========================= */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold text-yellow-300 mb-4">
            الاختبارات
          </h2>

          <div className="border border-dashed border-gray-700 rounded-xl p-8 text-center">

            <div className="text-5xl mb-4">
              📝
            </div>

            <p className="text-gray-400">
              سيتم عرض الاختبارات التي تم إنشاؤها هنا.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}