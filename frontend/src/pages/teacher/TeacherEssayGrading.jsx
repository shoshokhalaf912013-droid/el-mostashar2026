// src/pages/teacher/TeacherEssayGrading.jsx

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

export default function TeacherEssayGrading() {
  const { examId } = useParams();
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [exam, setExam] =
    useState(null);

  const [attempts, setAttempts] =
    useState([]);

  const [selectedAttemptId, setSelectedAttemptId] =
    useState(null);

  const [selectedQuestionIndex, setSelectedQuestionIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
  =====================================================
  الدرجة التي يكتبها المدرس
  =====================================================
  */

  const [awardedMarks, setAwardedMarks] =
    useState("");

  /*
  =====================================================
  تعليق المدرس
  =====================================================
  */

  const [teacherComment, setTeacherComment] =
    useState("");

  /*
  =====================================================
  تحميل البيانات
  =====================================================
  */

  const loadEssayAttempts = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response =
        await api.get(
          `/api/attempts/exam/${examId}/essay-attempts`
        );

      if (
        response.data?.success === false
      ) {
        throw new Error(
          response.data?.error ||
            "تعذر تحميل إجابات المقال."
        );
      }

      const loadedExam =
        response.data?.exam || null;

      const loadedAttempts =
        Array.isArray(
          response.data?.attempts
        )
          ? response.data.attempts
          : [];

      setExam(loadedExam);
      setAttempts(
        loadedAttempts
      );

      /*
      ---------------------------------------------------
      الاحتفاظ بالاختيار الحالي إن كان ما زال موجودًا
      ---------------------------------------------------
      */

      setSelectedAttemptId(
        (currentId) => {
          if (
            currentId &&
            loadedAttempts.some(
              (attempt) =>
                String(
                  attempt.attemptId
                ) ===
                String(currentId)
            )
          ) {
            return currentId;
          }

          return loadedAttempts.length >
            0
            ? String(
                loadedAttempts[0]
                  .attemptId
              )
            : null;
        }
      );

      /*
      ---------------------------------------------------
      التأكد من وجود سؤال مقالي
      ---------------------------------------------------
      */

      const firstAttempt =
        loadedAttempts[0];

      const firstEssayIndex =
        firstAttempt?.essayAnswers?.[0]
          ?.questionIndex;

      if (
        firstEssayIndex !==
          undefined &&
        firstEssayIndex !== null
      ) {
        setSelectedQuestionIndex(
          Number(
            firstEssayIndex
          )
        );
      } else {
        setSelectedQuestionIndex(
          0
        );
      }
    } catch (err) {
      console.error(
        "Teacher essay grading load error:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          err?.message ||
          "تعذر تحميل إجابات الأسئلة المقالية."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  تحميل الصفحة
  =====================================================
  */

  useEffect(() => {
    if (!examId) {
      setError(
        "معرف الامتحان غير موجود."
      );

      setLoading(false);

      return;
    }

    loadEssayAttempts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  /*
  =====================================================
  المحاولة المختارة
  =====================================================
  */

  const selectedAttempt =
    useMemo(() => {
      if (!attempts.length) {
        return null;
      }

      return (
        attempts.find(
          (attempt) =>
            String(
              attempt.attemptId
            ) ===
            String(
              selectedAttemptId
            )
        ) ||
        attempts[0]
      );
    }, [
      attempts,
      selectedAttemptId,
    ]);

  /*
  =====================================================
  الأسئلة المقالية للمحاولة
  =====================================================
  */

  const essayQuestions =
    useMemo(() => {
      if (
        !selectedAttempt ||
        !Array.isArray(
          selectedAttempt.essayAnswers
        )
      ) {
        return [];
      }

      return selectedAttempt.essayAnswers;
    }, [selectedAttempt]);

  /*
  =====================================================
  السؤال الحالي
  =====================================================
  */

  const selectedEssay =
    useMemo(() => {
      if (
        !essayQuestions.length
      ) {
        return null;
      }

      return (
        essayQuestions.find(
          (essay) =>
            Number(
              essay.questionIndex
            ) ===
            Number(
              selectedQuestionIndex
            )
        ) ||
        essayQuestions[0]
      );
    }, [
      essayQuestions,
      selectedQuestionIndex,
    ]);

  /*
  =====================================================
  تحديث بيانات التصحيح عند تغيير السؤال
  =====================================================
  */

  useEffect(() => {
    if (!selectedEssay) {
      setAwardedMarks("");
      setTeacherComment("");
      return;
    }

    setAwardedMarks(
      selectedEssay.awardedMarks !==
        null &&
        selectedEssay.awardedMarks !==
          undefined
        ? String(
            selectedEssay.awardedMarks
          )
        : ""
    );

    setTeacherComment(
      selectedEssay.teacherComment ||
        ""
    );

    setSuccessMessage("");
  }, [selectedEssay]);

  /*
  =====================================================
  حساب الإحصائيات
  =====================================================
  */

  const statistics =
    useMemo(() => {
      let totalEssays = 0;
      let gradedEssays = 0;
      let pendingEssays = 0;

      attempts.forEach(
        (attempt) => {
          (
            attempt.essayAnswers || []
          ).forEach((essay) => {
            totalEssays++;

            if (
              essay.graded === true
            ) {
              gradedEssays++;
            } else {
              pendingEssays++;
            }
          });
        }
      );

      return {
        totalEssays,
        gradedEssays,
        pendingEssays,
      };
    }, [attempts]);

  /*
  =====================================================
  تحويل التاريخ
  =====================================================
  */

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        value
      ).toLocaleString(
        "ar-EG",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "—";
    }
  };

  /*
  =====================================================
  تكوين رابط الصورة
  =====================================================
  */

  const getImageUrl = (
    imageUrl
  ) => {
    if (!imageUrl) {
      return "";
    }

    /*
    ---------------------------------------------------
    رابط كامل
    ---------------------------------------------------
    */

    if (
      imageUrl.startsWith(
        "http://"
      ) ||
      imageUrl.startsWith(
        "https://"
      )
    ) {
      return imageUrl;
    }

    /*
    ---------------------------------------------------
    رابط نسبي
    ---------------------------------------------------
    */

    const baseUrl =
      import.meta.env
        .VITE_API_URL || "";

    if (!baseUrl) {
      return imageUrl;
    }

    return `${baseUrl.replace(
      /\/$/,
      ""
    )}/${imageUrl.replace(
      /^\//,
      ""
    )}`;
  };

  /*
  =====================================================
  اختيار محاولة طالب
  =====================================================
  */

  const handleSelectAttempt = (
    attemptId
  ) => {
    setSelectedAttemptId(
      String(attemptId)
    );

    setSuccessMessage("");

    /*
    عند تغيير الطالب نبدأ من أول سؤال مقالي
    */

    const newAttempt =
      attempts.find(
        (attempt) =>
          String(
            attempt.attemptId
          ) ===
          String(attemptId)
      );

    if (
      newAttempt?.essayAnswers?.length
    ) {
      setSelectedQuestionIndex(
        Number(
          newAttempt.essayAnswers[0]
            .questionIndex
        )
      );
    }
  };

  /*
  =====================================================
  اختيار سؤال مقالي
  =====================================================
  */

  const handleSelectQuestion = (
    questionIndex
  ) => {
    setSelectedQuestionIndex(
      Number(questionIndex)
    );

    setSuccessMessage("");
  };

  /*
  =====================================================
  تغيير الدرجة
  =====================================================
  */

  const handleMarksChange = (
    value
  ) => {
    /*
    السماح بإفراغ الحقل مؤقتًا
    */

    if (value === "") {
      setAwardedMarks("");
      return;
    }

    /*
    السماح بالأرقام فقط مع رقم عشري
    */

    if (
      !/^\d*\.?\d*$/.test(value)
    ) {
      return;
    }

    setAwardedMarks(value);
  };

  /*
  =====================================================
  حفظ التصحيح
  =====================================================
  */

  const handleSaveGrade =
    async () => {
      if (
        !selectedAttempt ||
        !selectedEssay
      ) {
        return;
      }

      setSuccessMessage("");
      setError("");

      /*
      ---------------------------------------------------
      التحقق من الدرجة
      ---------------------------------------------------
      */

      if (
        awardedMarks === ""
      ) {
        setError(
          "من فضلك أدخل درجة السؤال."
        );

        return;
      }

      const marks =
        Number(awardedMarks);

      const maxMarks =
        Number(
          selectedEssay.marks
        ) || 0;

      if (
        !Number.isFinite(marks)
      ) {
        setError(
          "الدرجة المدخلة غير صحيحة."
        );

        return;
      }

      if (marks < 0) {
        setError(
          "لا يمكن أن تكون الدرجة أقل من صفر."
        );

        return;
      }

      if (
        marks > maxMarks
      ) {
        setError(
          `الدرجة لا يمكن أن تتجاوز ${maxMarks}.`
        );

        return;
      }

      try {
        setSaving(true);

        const response =
          await api.post(
            `/api/attempts/${selectedAttempt.attemptId}/grade-essay`,
            {
              questionIndex:
                Number(
                  selectedEssay.questionIndex
                ),

              awardedMarks:
                marks,

              teacherComment:
                teacherComment.trim(),
            }
          );

        if (
          response.data?.success ===
          false
        ) {
          throw new Error(
            response.data?.error ||
              "تعذر حفظ التصحيح."
          );
        }

        /*
        ---------------------------------------------------
        تحديث البيانات محليًا
        ---------------------------------------------------
        */

        setAttempts(
          (previousAttempts) =>
            previousAttempts.map(
              (attempt) => {
                if (
                  String(
                    attempt.attemptId
                  ) !==
                  String(
                    selectedAttempt.attemptId
                  )
                ) {
                  return attempt;
                }

                return {
                  ...attempt,

                  score:
                    response.data
                      ?.score ??
                    attempt.score,

                  essays:
                    (
                      attempt.essayAnswers ||
                      []
                    ).map(
                      (essay) => {
                        if (
                          Number(
                            essay.questionIndex
                          ) !==
                          Number(
                            selectedEssay.questionIndex
                          )
                        ) {
                          return essay;
                        }

                        return {
                          ...essay,

                          awardedMarks:
                            marks,

                          teacherComment:
                            teacherComment.trim(),

                          graded:
                            true,
                        };
                      }
                    ),
                };
              }
            )
        );

        /*
        ---------------------------------------------------
        تحديث الحقل بعد نجاح الحفظ
        ---------------------------------------------------
        */

        setAwardedMarks(
          String(marks)
        );

        setTeacherComment(
          teacherComment.trim()
        );

        setSuccessMessage(
          "تم حفظ تصحيح السؤال بنجاح."
        );
      } catch (err) {
        console.error(
          "Grade essay error:",
          err
        );

        setError(
          err?.response?.data
            ?.error ||
            err?.response?.data
              ?.message ||
            err?.message ||
            "فشل حفظ تصحيح السؤال."
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  =====================================================
  إعادة تحميل النتائج
  =====================================================
  */

  const handleRefresh =
    async () => {
      await loadEssayAttempts();
    };

  /*
  =====================================================
  العودة للامتحانات
  =====================================================
  */

  const handleBack = () => {
    navigate(
      "/teacher/exams"
    );
  };

  /*
  =====================================================
  Loading
  =====================================================
  */

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-950 text-white p-6"
      >
        <div className="max-w-7xl mx-auto">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">

            <div className="text-5xl mb-5">
              ⏳
            </div>

            <h1 className="text-xl font-bold text-yellow-400">
              جاري تحميل إجابات الطلاب...
            </h1>

            <p className="text-gray-400 mt-2">
              من فضلك انتظر.
            </p>

          </div>

        </div>
      </div>
    );
  }

  /*
  =====================================================
  Error
  =====================================================
  */

  if (
    error &&
    !exam &&
    !attempts.length
  ) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-950 text-white p-6"
      >
        <div className="max-w-4xl mx-auto">

          <div className="bg-red-950/40 border border-red-800 rounded-2xl p-8">

            <h1 className="text-2xl font-bold text-red-400 mb-4">
              تعذر تحميل صفحة التصحيح
            </h1>

            <p className="text-gray-300 leading-7">
              {error}
            </p>

            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-bold"
              >
                🔄 إعادة المحاولة
              </button>

              <button
                type="button"
                onClick={
                  handleBack
                }
                className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-xl font-bold"
              >
                ← العودة للاختبارات
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /*
  =====================================================
  لا توجد محاولات
  =====================================================
  */

  if (
    !attempts.length
  ) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-950 text-white p-6"
      >
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h1 className="text-3xl font-bold text-yellow-400">
                ✏️ تصحيح الأسئلة المقالية
              </h1>

              <p className="text-gray-400 mt-2">
                {exam?.title ||
                  "الامتحان"}
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleBack
              }
              className="bg-gray-800 hover:bg-gray-700 px-5 py-3 rounded-xl font-bold"
            >
              ← العودة
            </button>

          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">

            <div className="text-6xl mb-5">
              📭
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              لا توجد محاولات تحتاج إلى عرض
            </h2>

            <p className="text-gray-400 leading-7">
              لا توجد محاولات مسلّمة تحتوي على
              أسئلة مقالية لهذا الامتحان حتى الآن.
            </p>

          </div>

        </div>
      </div>
    );
  }

  /*
  =====================================================
  بيانات السؤال الحالي
  =====================================================
  */

  const imageUrl =
    getImageUrl(
      selectedEssay?.imageUrl
    );

  const maxMarks =
    Number(
      selectedEssay?.marks
    ) || 0;

  const currentScore =
    Number(
      selectedAttempt?.score
    ) || 0;

  /*
  =====================================================
  Render
  =====================================================
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

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              ✏️ تصحيح الأسئلة المقالية
            </h1>

            <p className="text-gray-400 mt-2">
              {exam?.title ||
                "الامتحان"}
            </p>
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-3 rounded-xl font-bold disabled:opacity-50"
            >
              🔄 تحديث
            </button>

            <button
              type="button"
              onClick={
                handleBack
              }
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-3 rounded-xl font-bold"
            >
              ← الاختبارات
            </button>

          </div>

        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <div className="text-gray-400 text-sm mb-2">
              إجمالي إجابات المقال
            </div>

            <div className="text-3xl font-bold text-white">
              {
                statistics.totalEssays
              }
            </div>

          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <div className="text-gray-400 text-sm mb-2">
              تم تصحيحها
            </div>

            <div className="text-3xl font-bold text-green-400">
              {
                statistics.gradedEssays
              }
            </div>

          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <div className="text-gray-400 text-sm mb-2">
              تحتاج تصحيح
            </div>

            <div className="text-3xl font-bold text-orange-400">
              {
                statistics.pendingEssays
              }
            </div>

          </div>

        </div>

        {/* =================================================
            GLOBAL ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-800 rounded-xl p-4">

            <div className="flex items-start justify-between gap-4">

              <div>
                <div className="font-bold text-red-300 mb-1">
                  تنبيه
                </div>

                <p className="text-gray-300">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMessage && (
          <div className="mb-6 bg-green-950/40 border border-green-800 rounded-xl p-4">

            <div className="text-green-300 font-bold">
              ✓ {successMessage}
            </div>

          </div>
        )}

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-6">

          {/* =================================================
              STUDENTS / ATTEMPTS
          ================================================= */}

          <aside className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-fit">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-lg font-bold text-yellow-300">
                الطلاب
              </h2>

              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                {
                  attempts.length
                }
              </span>

            </div>

            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">

              {attempts.map(
                (attempt, index) => {
                  const isSelected =
                    String(
                      attempt.attemptId
                    ) ===
                    String(
                      selectedAttemptId
                    );

                  const essayList =
                    attempt.essayAnswers ||
                    [];

                  const gradedCount =
                    essayList.filter(
                      (essay) =>
                        essay.graded ===
                        true
                    ).length;

                  const pendingCount =
                    essayList.length -
                    gradedCount;

                  return (
                    <button
                      key={
                        attempt.attemptId
                      }
                      type="button"
                      onClick={() =>
                        handleSelectAttempt(
                          attempt.attemptId
                        )
                      }
                      className={`w-full text-right rounded-xl p-4 border transition ${
                        isSelected
                          ? "bg-purple-950 border-purple-600"
                          : "bg-gray-800 border-gray-700 hover:border-gray-600"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="font-bold text-white truncate">
                            الطالب #{index + 1}
                          </div>

                          <div className="text-xs text-gray-500 mt-1 break-all">
                            ID:{" "}
                            {
                              attempt.userId
                            }
                          </div>

                        </div>

                        {pendingCount >
                        0 ? (
                          <span className="shrink-0 bg-orange-900 text-orange-300 border border-orange-700 px-2 py-1 rounded-full text-xs">
                            يحتاج تصحيح
                          </span>
                        ) : (
                          <span className="shrink-0 bg-green-900 text-green-300 border border-green-700 px-2 py-1 rounded-full text-xs">
                            مكتمل
                          </span>
                        )}

                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">

                        <div className="bg-gray-900/70 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">
                            المقال
                          </div>

                          <div className="font-bold text-white">
                            {
                              essayList.length
                            }
                          </div>
                        </div>

                        <div className="bg-gray-900/70 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">
                            المصحح
                          </div>

                          <div className="font-bold text-green-400">
                            {
                              gradedCount
                            }
                          </div>
                        </div>

                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        التسليم:
                        {" "}
                        {
                          formatDate(
                            attempt.endedAt
                          )
                        }
                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </aside>

          {/* =================================================
              GRADING AREA
          ================================================= */}

          <main className="min-w-0">

            {/* =================================================
                STUDENT SUMMARY
            ================================================= */}

            {selectedAttempt && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div>

                    <div className="text-gray-400 text-sm mb-1">
                      المحاولة المختارة
                    </div>

                    <div className="font-bold text-xl text-white break-all">
                      الطالب:
                      {" "}
                      {
                        selectedAttempt.userId
                      }
                    </div>

                    <div className="text-sm text-gray-500 mt-2">
                      تاريخ التسليم:
                      {" "}
                      {
                        formatDate(
                          selectedAttempt.endedAt
                        )
                      }
                    </div>

                  </div>

                  <div className="bg-gray-800 rounded-xl px-6 py-4 text-center">

                    <div className="text-gray-400 text-sm">
                      الدرجة الحالية
                    </div>

                    <div className="text-2xl font-bold text-yellow-400">
                      {currentScore}
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                QUESTION TABS
            ================================================= */}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">

              <h2 className="text-lg font-bold text-yellow-300 mb-4">
                الأسئلة المقالية
              </h2>

              <div className="flex flex-wrap gap-3">

                {essayQuestions.map(
                  (essay) => {
                    const active =
                      Number(
                        essay.questionIndex
                      ) ===
                      Number(
                        selectedQuestionIndex
                      );

                    const graded =
                      essay.graded ===
                      true;

                    return (
                      <button
                        key={
                          essay.questionIndex
                        }
                        type="button"
                        onClick={() =>
                          handleSelectQuestion(
                            essay.questionIndex
                          )
                        }
                        className={`min-w-[110px] px-4 py-3 rounded-xl border font-bold transition ${
                          active
                            ? "bg-purple-700 border-purple-400 text-white"
                            : graded
                            ? "bg-green-950 border-green-700 text-green-300 hover:bg-green-900"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <div>
                          سؤال{" "}
                          {
                            essay.questionNumber
                          }
                        </div>

                        <div className="text-xs mt-1 opacity-80">
                          {graded
                            ? "✓ تم التصحيح"
                            : "يحتاج تصحيح"}
                        </div>
                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* =================================================
                QUESTION
            ================================================= */}

            {selectedEssay ? (
              <div className="space-y-6">

                {/* Question card */}
                <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">

                    <div className="flex items-center gap-3">

                      <span className="bg-purple-900 text-purple-300 border border-purple-700 px-4 py-2 rounded-full font-bold">
                        سؤال{" "}
                        {
                          selectedEssay.questionNumber
                        }
                      </span>

                      <span className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm">
                        سؤال مقالي
                      </span>

                    </div>

                    <div className="bg-yellow-950 border border-yellow-800 text-yellow-300 px-4 py-2 rounded-xl font-bold">
                      الدرجة القصوى:
                      {" "}
                      {maxMarks}
                    </div>

                  </div>

                  <div className="bg-gray-800 rounded-xl p-5">

                    <div className="text-sm text-gray-400 mb-3">
                      نص السؤال
                    </div>

                    <p className="text-xl leading-9 text-white whitespace-pre-wrap">
                      {
                        selectedEssay.questionText ||
                        "لا يوجد نص للسؤال."
                      }
                    </p>

                  </div>

                </section>

                {/* =================================================
                    STUDENT TEXT ANSWER
                ================================================= */}

                <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-xl font-bold text-blue-300">
                      ✍️ إجابة الطالب النصية
                    </h2>

                    {selectedEssay.textAnswer?.trim() ? (
                      <span className="bg-green-900 text-green-300 border border-green-700 px-3 py-1 rounded-full text-sm">
                        توجد إجابة
                      </span>
                    ) : (
                      <span className="bg-gray-800 text-gray-500 border border-gray-700 px-3 py-1 rounded-full text-sm">
                        لا توجد إجابة نصية
                      </span>
                    )}

                  </div>

                  <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 min-h-[180px]">

                    {selectedEssay.textAnswer?.trim() ? (
                      <p className="text-lg leading-9 text-gray-100 whitespace-pre-wrap">
                        {
                          selectedEssay.textAnswer
                        }
                      </p>
                    ) : (
                      <div className="h-[150px] flex items-center justify-center text-gray-600">
                        الطالب لم يكتب إجابة نصية.
                      </div>
                    )}

                  </div>

                </section>

                {/* =================================================
                    STUDENT IMAGE ANSWER
                ================================================= */}

                <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-xl font-bold text-blue-300">
                      🖼️ صورة حل الطالب
                    </h2>

                    {imageUrl ? (
                      <span className="bg-green-900 text-green-300 border border-green-700 px-3 py-1 rounded-full text-sm">
                        توجد صورة
                      </span>
                    ) : (
                      <span className="bg-gray-800 text-gray-500 border border-gray-700 px-3 py-1 rounded-full text-sm">
                        لا توجد صورة
                      </span>
                    )}

                  </div>

                  {imageUrl ? (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">

                      <div className="max-h-[700px] overflow-auto flex justify-center">

                        <img
                          src={imageUrl}
                          alt="حل الطالب"
                          className="max-w-full h-auto rounded-lg object-contain"
                        />

                      </div>

                    </div>
                  ) : (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl min-h-[180px] flex items-center justify-center text-gray-600">
                      الطالب لم يرفع صورة للحل.
                    </div>
                  )}

                </section>

                {/* =================================================
                    GRADING CARD
                ================================================= */}

                <section className="bg-gray-900 border border-purple-800 rounded-2xl p-6">

                  <div className="mb-6">

                    <h2 className="text-2xl font-bold text-purple-300">
                      📝 تصحيح السؤال
                    </h2>

                    <p className="text-gray-400 mt-2">
                      أدخل الدرجة التي يستحقها الطالب
                      ثم أضف تعليقًا إذا أردت.
                    </p>

                  </div>

                  {/* Grade */}
                  <div className="mb-6">

                    <label className="block text-yellow-300 font-bold mb-2">
                      الدرجة المستحقة
                    </label>

                    <div className="flex items-center gap-3">

                      <input
                        type="text"
                        inputMode="decimal"
                        value={
                          awardedMarks
                        }
                        onChange={(e) =>
                          handleMarksChange(
                            e.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="0"
                        className="
                          w-full
                          md:w-64
                          bg-gray-950
                          border
                          border-gray-700
                          focus:border-yellow-500
                          rounded-xl
                          px-5
                          py-4
                          text-white
                          text-xl
                          font-bold
                          outline-none
                          disabled:opacity-50
                        "
                      />

                      <div className="text-gray-400 text-lg font-bold">
                        / {maxMarks}
                      </div>

                    </div>

                    <p className="text-gray-500 text-sm mt-2">
                      الحد الأقصى للدرجة هو{" "}
                      {maxMarks}{" "}
                      ولن يسمح النظام بدرجة أكبر.
                    </p>

                  </div>

                  {/* Teacher comment */}
                  <div className="mb-6">

                    <label className="block text-yellow-300 font-bold mb-2">
                      تعليق المدرس
                    </label>

                    <textarea
                      value={
                        teacherComment
                      }
                      onChange={(e) =>
                        setTeacherComment(
                          e.target.value
                        )
                      }
                      disabled={saving}
                      rows={5}
                      placeholder="اكتب تعليقك على إجابة الطالب..."
                      className="
                        w-full
                        bg-gray-950
                        border
                        border-gray-700
                        focus:border-yellow-500
                        rounded-xl
                        px-5
                        py-4
                        text-white
                        resize-y
                        outline-none
                        disabled:opacity-50
                      "
                    />

                  </div>

                  {/* Current grading status */}
                  <div className="mb-6">

                    {selectedEssay.graded ? (
                      <div className="bg-green-950/40 border border-green-800 rounded-xl p-4">

                        <div className="text-green-300 font-bold">
                          ✓ هذا السؤال تم تصحيحه
                        </div>

                        <div className="text-gray-400 text-sm mt-1">
                          يمكنك تعديل الدرجة أو التعليق
                          ثم الضغط على حفظ مرة أخرى.
                        </div>

                      </div>
                    ) : (
                      <div className="bg-orange-950/40 border border-orange-800 rounded-xl p-4">

                        <div className="text-orange-300 font-bold">
                          ⚠ هذا السؤال لم يتم تصحيحه بعد
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Save */}
                  <button
                    type="button"
                    onClick={
                      handleSaveGrade
                    }
                    disabled={
                      saving
                    }
                    className="
                      w-full
                      bg-gradient-to-r
                      from-purple-600
                      to-purple-800
                      hover:from-purple-500
                      hover:to-purple-700
                      disabled:from-gray-700
                      disabled:to-gray-800
                      px-6
                      py-4
                      rounded-xl
                      font-bold
                      text-lg
                      shadow-lg
                      transition
                    "
                  >
                    {saving
                      ? "⏳ جاري حفظ التصحيح..."
                      : "💾 حفظ تصحيح السؤال"}
                  </button>

                </section>

              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">

                <div className="text-5xl mb-4">
                  📝
                </div>

                <h2 className="text-xl font-bold text-white">
                  اختر سؤالًا مقاليًا
                </h2>

                <p className="text-gray-400 mt-2">
                  اختر أحد الأسئلة من الأعلى لبدء التصحيح.
                </p>

              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}