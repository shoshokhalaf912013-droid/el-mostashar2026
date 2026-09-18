// src/pages/teacher/TeacherExams.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../../utils/api";

export default function TeacherExams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  /*
  ========================================================
  تحميل الامتحانات
  ========================================================
  */

  const loadExams = async () => {
    try {
      setLoading(true);
      setError("");

      const res =
        await api.get(
          "/api/exams"
        );

      const loadedExams =
        Array.isArray(
          res.data?.exams
        )
          ? res.data.exams
          : [];

      setExams(loadedExams);
    } catch (err) {
      console.error(
        "Teacher exams load error:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "تعذر تحميل الامتحانات."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ========================================================
  تحميل عند فتح الصفحة
  ========================================================
  */

  useEffect(() => {
    loadExams();
  }, []);

  /*
  ========================================================
  حساب عدد أسئلة المقال في كل امتحان
  ========================================================
  */

  const getEssayCount = (
    exam
  ) => {
    if (
      !Array.isArray(
        exam?.questions
      )
    ) {
      return 0;
    }

    return exam.questions.filter(
      (question) =>
        question?.type ===
        "essay"
    ).length;
  };

  /*
  ========================================================
  إحصائيات الصفحة
  ========================================================
  */

  const statistics = useMemo(() => {
    const total =
      exams.length;

    const published =
      exams.filter(
        (exam) =>
          exam.status ===
          "published"
      ).length;

    const essayExams =
      exams.filter(
        (exam) =>
          getEssayCount(exam) > 0
      ).length;

    const totalEssayQuestions =
      exams.reduce(
        (sum, exam) =>
          sum +
          getEssayCount(exam),
        0
      );

    return {
      total,
      published,
      essayExams,
      totalEssayQuestions,
    };
  }, [exams]);

  /*
  ========================================================
  فتح صفحة تصحيح المقال
  ========================================================
  */

  const openEssayGrading = (
    examId
  ) => {
    if (!examId) return;

    navigate(
      `/teacher/exam-grading/${examId}`
    );
  };

  /*
  ========================================================
  Loading
  ========================================================
  */

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-950 text-white p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">
              ⏳
            </div>

            <p className="text-gray-300 text-lg">
              جاري تحميل الامتحانات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  ========================================================
  UI
  ========================================================
  */

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-950 text-white p-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-yellow-400">
                📝 الاختبارات
              </h1>

              <p className="text-gray-400 mt-2">
                عرض الاختبارات وتصحيح إجابات
                الأسئلة المقالية.
              </p>
            </div>

            <button
              type="button"
              onClick={loadExams}
              className="
                bg-gray-800
                hover:bg-gray-700
                border border-gray-700
                px-5
                py-3
                rounded-xl
                font-bold
                transition
              "
            >
              🔄 تحديث
            </button>

          </div>
        </div>

        {/* =================================================
            IMPORTANT INFO
        ================================================= */}

        <div className="mb-6 bg-blue-950/40 border border-blue-800 rounded-2xl p-5">

          <div className="flex gap-3 items-start">

            <div className="text-2xl">
              ℹ️
            </div>

            <div>
              <h2 className="font-bold text-blue-300 text-lg mb-1">
                ملاحظة مهمة
              </h2>

              <p className="text-gray-300 leading-7">
                إنشاء وإدارة الامتحانات يتم من
                منطقة الـSuper Admin.
                هذه الصفحة مخصصة للمدرس لمتابعة
                الامتحانات وتصحيح الأسئلة المقالية.
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <div className="text-gray-400 text-sm mb-2">
              إجمالي الامتحانات
            </div>

            <div className="text-3xl font-bold text-white">
              {statistics.total}
            </div>

          </div>

          {/* Published */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <div className="text-gray-400 text-sm mb-2">
              الامتحانات المنشورة
            </div>

            <div className="text-3xl font-bold text-green-400">
              {statistics.published}
            </div>

          </div>

          {/* Essay exams */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <div className="text-gray-400 text-sm mb-2">
              امتحانات بها مقالي
            </div>

            <div className="text-3xl font-bold text-purple-400">
              {statistics.essayExams}
            </div>

          </div>

          {/* Essay questions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <div className="text-gray-400 text-sm mb-2">
              إجمالي أسئلة المقال
            </div>

            <div className="text-3xl font-bold text-yellow-400">
              {statistics.totalEssayQuestions}
            </div>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-800 rounded-2xl p-5">

            <div className="text-red-300 font-bold mb-2">
              حدث خطأ
            </div>

            <p className="text-gray-300">
              {error}
            </p>

            <button
              type="button"
              onClick={loadExams}
              className="
                mt-4
                bg-red-700
                hover:bg-red-600
                px-5
                py-2
                rounded-lg
                font-bold
              "
            >
              إعادة المحاولة
            </button>

          </div>
        )}

        {/* =================================================
            NO EXAMS
        ================================================= */}

        {!error &&
          exams.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">

              <div className="text-6xl mb-5">
                📝
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                لا توجد امتحانات
              </h2>

              <p className="text-gray-400">
                لم يتم إنشاء أي امتحانات حتى الآن.
              </p>

            </div>
          )}

        {/* =================================================
            EXAMS LIST
        ================================================= */}

        {!error &&
          exams.length > 0 && (
            <div className="space-y-5">

              {exams.map(
                (exam) => {
                  const essayCount =
                    getEssayCount(
                      exam
                    );

                  const questionCount =
                    Array.isArray(
                      exam.questions
                    )
                      ? exam.questions
                          .length
                      : Number(
                          exam.questionsCount
                        ) || 0;

                  const isPublished =
                    exam.status ===
                    "published";

                  return (
                    <div
                      key={
                        exam._id
                      }
                      className="
                        bg-gray-900
                        border
                        border-gray-800
                        rounded-2xl
                        p-6
                        hover:border-gray-700
                        transition
                      "
                    >

                      {/* =================================================
                          EXAM HEADER
                      ================================================= */}

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-2 mb-3">

                            <h2 className="text-xl font-bold text-white">
                              {exam.title ||
                                "امتحان بدون عنوان"}
                            </h2>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isPublished
                                  ? "bg-green-900 text-green-300 border border-green-700"
                                  : "bg-gray-800 text-gray-400 border border-gray-700"
                              }`}
                            >
                              {isPublished
                                ? "منشور"
                                : exam.status ===
                                  "closed"
                                ? "مغلق"
                                : "مسودة"}
                            </span>

                          </div>

                          {exam.description && (
                            <p className="text-gray-400 mb-4 leading-7">
                              {
                                exam.description
                              }
                            </p>
                          )}

                          {/* =================================================
                              EXAM META
                          ================================================= */}

                          <div className="flex flex-wrap gap-3">

                            <div className="bg-gray-800 rounded-lg px-4 py-2">

                              <span className="text-gray-400 text-sm">
                                الأسئلة:
                              </span>

                              <span className="font-bold text-white mr-2">
                                {
                                  questionCount
                                }
                              </span>

                            </div>

                            <div className="bg-gray-800 rounded-lg px-4 py-2">

                              <span className="text-gray-400 text-sm">
                                المدة:
                              </span>

                              <span className="font-bold text-white mr-2">
                                {Number(
                                  exam.duration
                                ) || 0}{" "}
                                دقيقة
                              </span>

                            </div>

                            <div
                              className={`rounded-lg px-4 py-2 ${
                                essayCount >
                                0
                                  ? "bg-purple-950 border border-purple-800"
                                  : "bg-gray-800"
                              }`}
                            >

                              <span className="text-gray-400 text-sm">
                                المقال:
                              </span>

                              <span
                                className={`font-bold mr-2 ${
                                  essayCount >
                                  0
                                    ? "text-purple-300"
                                    : "text-gray-500"
                                }`}
                              >
                                {
                                  essayCount
                                }
                              </span>

                            </div>

                          </div>

                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="flex flex-col gap-3 lg:min-w-[220px]">

                          {essayCount >
                          0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                openEssayGrading(
                                  exam._id
                                )
                              }
                              className="
                                w-full
                                bg-gradient-to-r
                                from-purple-600
                                to-purple-800
                                hover:from-purple-500
                                hover:to-purple-700
                                px-6
                                py-3
                                rounded-xl
                                font-bold
                                text-white
                                shadow-lg
                                transition
                              "
                            >
                              ✏️ تصحيح الأسئلة المقالية
                            </button>
                          ) : (
                            <div
                              className="
                                w-full
                                bg-gray-800
                                border
                                border-gray-700
                                px-6
                                py-3
                                rounded-xl
                                text-center
                                text-gray-500
                                font-bold
                              "
                            >
                              لا توجد أسئلة مقالية
                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>
    </div>
  );
}