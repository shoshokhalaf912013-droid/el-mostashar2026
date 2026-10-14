// src/pages/Student/ExamResult.jsx

import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function ExamResult() {
  const location = useLocation();

  const {
    score = 0,
    total = 1,
    pendingEssayCount = 0,
  } = location.state || {};

  const safeScore = Number(score) || 0;
  const safeTotal = Number(total) || 0;
  const safePendingEssayCount =
    Number(pendingEssayCount) || 0;

  /*
  ========================================================
  INTERNAL PASS RULE
  ========================================================

  60% is intentionally kept as an internal rule only.
  It is NOT displayed to the student.

  Reports/admin systems remain responsible for monitoring
  the student's actual performance.
  ========================================================
  */

  const passed =
    safeTotal > 0 &&
    safeScore / safeTotal >= 0.6;

  /*
  Prevent unused-variable issues while keeping the
  internal rule available for future/report logic.
  */
  void passed;

  const hasPendingEssays =
    safePendingEssayCount > 0;

  return (
    <div
      className="p-6 text-white text-center min-h-screen"
      dir="rtl"
    >
      <h1 className="text-3xl text-yellow-400 font-bold mb-6">
        نتيجة الامتحان
      </h1>

      <div className="bg-gray-900 p-6 rounded-lg max-w-2xl mx-auto">

        {/* =========================
            CURRENT SCORE
        ========================= */}

        <div className="mb-6">
          <p className="text-xl mb-3">
            الدرجة الحالية
          </p>

          <p className="text-4xl font-bold text-green-400">
            {safeScore}{" "}
            <span className="text-2xl text-white">
              من {safeTotal}
            </span>
          </p>
        </div>


        {/* =========================
            PENDING ESSAYS
        ========================= */}

        {hasPendingEssays && (
          <div className="bg-yellow-900/40 border border-yellow-600 rounded-lg p-5 mb-6">

            <h2 className="text-xl font-bold text-yellow-400 mb-3">
              توجد أسئلة مقالية في انتظار التصحيح
            </h2>

            <p className="text-gray-200 leading-7">
              تم تسليم امتحانك بنجاح، ولكن توجد{" "}
              <span className="font-bold text-yellow-400">
                {safePendingEssayCount}
              </span>{" "}
              أسئلة مقالية لم يتم تصحيحها بواسطة المدرس بعد.
            </p>

            <p className="text-gray-400 mt-3 text-sm leading-6">
              الدرجة الحالية لا تمثل النتيجة النهائية
              حتى يتم الانتهاء من تصحيح الأسئلة المقالية.
            </p>

          </div>
        )}


        {/* =========================
            NO PASS / FAIL MESSAGE
            INTENTIONALLY HIDDEN
        ========================= */}

        {!hasPendingEssays && (
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-gray-300">
              تم تسجيل نتيجة الامتحان بنجاح.
            </p>
          </div>
        )}


        {/* =========================
            BACK TO EXAMS
        ========================= */}

        <Link
          to="/exam"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 block rounded transition"
        >
          العودة للامتحانات
        </Link>

      </div>
    </div>
  );
}