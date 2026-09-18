// src/pages/Student/ExamResult.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../utils/api";

export default function ExamResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ============================================================
  تحميل النتيجة من الـBackend
  ============================================================

  مهم جدًا:
  لا نعتمد على location.state لأن state يختفي عند Refresh.

  الرابط:
  /student/exam-result/:id

  والـ id هنا هو attempt id.
  ============================================================
  */
  useEffect(() => {
    let cancelled = false;

    const loadResult = async () => {
      if (!id) {
        setError("لم يتم العثور على رقم المحاولة.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
        --------------------------------------------------------
        1) تحميل المحاولة
        --------------------------------------------------------
        */
        const attemptResponse = await api.get(
          `/api/attempts/${id}`
        );

        const loadedAttempt =
          attemptResponse.data?.attempt;

        if (!loadedAttempt) {
          throw new Error(
            "لم يتم العثور على نتيجة هذه المحاولة."
          );
        }

        /*
        --------------------------------------------------------
        2) تحميل الامتحان
        --------------------------------------------------------
        نحتاج الامتحان لحساب إجمالي الدرجات الحقيقي.
        --------------------------------------------------------
        */
        const examId =
          loadedAttempt.examId ||
          loadedAttempt.exam?._id ||
          loadedAttempt.exam?.id;

        if (!examId) {
          throw new Error(
            "تعذر تحديد الامتحان المرتبط بالمحاولة."
          );
        }

        const examResponse = await api.get(
          `/api/exams/${examId}`
        );

        const loadedExam =
          examResponse.data?.exam;

        if (!loadedExam) {
          throw new Error(
            "تعذر تحميل بيانات الامتحان."
          );
        }

        if (cancelled) return;

        setAttempt(loadedAttempt);
        setExam(loadedExam);
      } catch (err) {
        console.error(
          "ExamResult load error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "تعذر تحميل نتيجة الامتحان."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
  ============================================================
  إجمالي الدرجات الحقيقي
  ============================================================
  */
  const totalMarks = useMemo(() => {
    if (!exam?.questions?.length) {
      return 0;
    }

    return exam.questions.reduce(
      (sum, question) =>
        sum + (Number(question?.marks) || 1),
      0
    );
  }, [exam]);

  /*
  ============================================================
  الدرجة
  ============================================================
  */
  const score = useMemo(() => {
    return Number(attempt?.score) || 0;
  }, [attempt]);

  /*
  ============================================================
  النسبة
  ============================================================
  */
  const percentage = useMemo(() => {
    if (totalMarks <= 0) {
      return 0;
    }

    return Math.round(
      (score / totalMarks) * 100
    );
  }, [score, totalMarks]);

  /*
  ============================================================
  حالات خاصة بالمقالي
  ============================================================
  */
  const pendingEssayCount =
    Number(
      attempt?.pendingEssayCount
    ) || 0;

  /*
  ============================================================
  Loading
  ============================================================
  */
  if (loading) {
    return (
      <div
        className="min-h-screen bg-black text-white flex items-center justify-center p-6"
        dir="rtl"
      >
        <div className="text-yellow-400 text-xl">
          جاري تحميل النتيجة...
        </div>
      </div>
    );
  }

  /*
  ============================================================
  Error
  ============================================================
  */
  if (error || !attempt || !exam) {
    return (
      <div
        className="min-h-screen bg-black text-white flex items-center justify-center p-6"
        dir="rtl"
      >
        <div
          className="w-full max-w-xl rounded-2xl p-8 text-center"
          style={{
            background: "#111",
            border: "1px solid #444",
          }}
        >
          <h2 className="text-xl text-red-400 mb-4">
            تعذر تحميل النتيجة
          </h2>

          <p className="text-gray-300 mb-6">
            {error || "بيانات النتيجة غير متاحة."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold"
          >
            ← رجوع
          </button>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  Render
  ============================================================
  */
  return (
    <div
      className="min-h-screen bg-black text-white p-6"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto">

        {/* العودة */}
        <div className="flex justify-start mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-7 py-3 rounded-xl bg-yellow-400 text-black font-bold"
          >
            ← رجوع
          </button>
        </div>

        {/* بطاقة النتيجة */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "#111",
            border: "1px solid #333",
            boxShadow:
              "0 0 25px rgba(255,215,0,0.08)",
          }}
        >
          <h1 className="text-3xl md:text-4xl text-yellow-400 mb-8">
            {exam.title}
          </h1>

          <div
            className="rounded-2xl p-8"
            style={{
              background: "#111",
              border: "1px solid #444",
            }}
          >
            <p className="text-yellow-400 text-lg mb-3">
              تم إنهاء الامتحان بنجاح 🎉
            </p>

            <p className="text-gray-300 mb-3">
              نتيجتك:
            </p>

            <p
              className="text-yellow-400 font-bold"
              style={{
                fontSize: "46px",
                lineHeight: 1.2,
              }}
            >
              {score} / {totalMarks}
            </p>

            <p className="text-yellow-400 text-xl mt-4">
              الدرجة: {percentage}%
            </p>

            {pendingEssayCount > 0 && (
              <div className="mt-6 rounded-xl p-4 bg-gray-900 border border-gray-700">
                <p className="text-yellow-400">
                  يوجد {pendingEssayCount} سؤال مقالي
                  في انتظار التصحيح.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
