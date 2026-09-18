// src/pages/Student/TakeExam.jsx

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";

export default function TakeExam() {
  const { id } = useParams(); // attempt id
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [exam, setExam] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);

  /*
  ========================================================
  answers structure:

  {
    0: {
      choiceIndex: 1,
      textAnswer: "",
      imageUrl: ""
    },

    1: {
      choiceIndex: null,
      textAnswer: "answer...",
      imageUrl: "/uploads/example.jpg"
    }
  }
  ========================================================
  */
  const [answers, setAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const heartbeatRef = useRef(null);
  const autosaveRef = useRef(null);
  const autoSubmitCalledRef = useRef(false);

  /*
  ========================================================
  IMPORTANT:
  Keep the latest answers available to callbacks/timers
  ========================================================
  */
  const answersRef = useRef({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  /*
  ========================================================
  Load attempt + exam
  ========================================================
  */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/attempts/${id}`);
        const att = res.data.attempt;

        /*
        ========================================================
        منع إعادة دخول محاولة انتهت بالفعل

        الـBackend هو المصدر الحقيقي للحالة.
        إذا كانت المحاولة submitted / failed / abandoned
        فلا نعيد فتح شاشة الامتحان عند Refresh.
        نرسل الطالب مباشرة إلى صفحة النتيجة.
        ========================================================
        */
        if (att?.status && att.status !== "in_progress") {
          const examRes = await api.get(
            `/api/exams/${att.examId}`
          );

          const loadedExam = examRes.data.exam;

          const totalMarks = (loadedExam?.questions || []).reduce(
            (sum, question) =>
              sum + (Number(question?.marks) || 1),
            0
          );

          navigate(
            `/student/exam-result/${id}`,
            {
              replace: true,
              state: {
                score: Number(att.score) || 0,
                total: totalMarks || loadedExam?.questions?.length || 0,
                pendingEssayCount: 0,
                attemptStatus: att.status,
                alreadySubmitted: true,
              },
            }
          );

          return;
        }

        setAttempt(att);

        const examRes = await api.get(
          `/api/exams/${att.examId}`
        );

        const loadedExam = examRes.data.exam;

        setExam(loadedExam);

        /*
        Convert backend answers
        into frontend map
        */
        const ansMap = {};

        (att.answers || []).forEach((a) => {
          ansMap[a.questionIndex] = {
            choiceIndex:
              a.choiceIndex !== undefined &&
              a.choiceIndex !== null
                ? a.choiceIndex
                : null,

            textAnswer: a.textAnswer || "",

            imageUrl: a.imageUrl || "",
          };
        });

        setAnswers(ansMap);
        answersRef.current = ansMap;

        const defaultDuration =
          loadedExam.duration ||
          loadedExam.durationMinutes ||
          30;

        setTimeLeft(
          att.remainingSeconds ??
            defaultDuration * 60
        );
      } catch (err) {
        console.error(err);

        alert(
          "فشل تحميل الامتحان/المحاولة"
        );

        navigate("/");
      }
    };

    load();

    // eslint-disable-next-line
  }, [id]);

  /*
  ========================================================
  Convert answers to backend array

  sourceAnswers:
  Optional parameter so we can explicitly pass the
  newest answers when necessary.
  ========================================================
  */
  const mapAnswersArray = useCallback(
    (sourceAnswers = answers) => {
      const arr = [];

      Object.keys(sourceAnswers).forEach((key) => {
        const questionIndex = Number(key);
        const answer = sourceAnswers[key] || {};

        arr.push({
          questionIndex,

          choiceIndex:
            answer.choiceIndex !== undefined &&
            answer.choiceIndex !== null
              ? answer.choiceIndex
              : null,

          textAnswer:
            answer.textAnswer || "",

          imageUrl:
            answer.imageUrl || "",
        });
      });

      return arr;
    },
    [answers]
  );

  /*
  ========================================================
  Check if question is answered
  ========================================================
  */
  const isQuestionAnswered = useCallback(
    (questionIndex) => {
      const answer = answers[questionIndex];

      if (!answer) return false;

      /*
      MCQ
      */
      if (
        answer.choiceIndex !== undefined &&
        answer.choiceIndex !== null
      ) {
        return true;
      }

      /*
      Essay text
      */
      if (
        typeof answer.textAnswer === "string" &&
        answer.textAnswer.trim() !== ""
      ) {
        return true;
      }

      /*
      Essay image
      */
      if (
        typeof answer.imageUrl === "string" &&
        answer.imageUrl.trim() !== ""
      ) {
        return true;
      }

      return false;
    },
    [answers]
  );

  /*
  ========================================================
  Check all questions answered
  ========================================================
  */
  const areAllQuestionsAnswered =
    useCallback(() => {
      if (!exam?.questions?.length) {
        return false;
      }

      return exam.questions.every(
        (_, index) =>
          isQuestionAnswered(index)
      );
    }, [exam, isQuestionAnswered]);

  /*
  ========================================================
  Autosave
  ========================================================
  */
  const doAutosave = useCallback(async () => {
    try {
      const latestAnswers =
        answersRef.current;

      await api.post(
        `/api/attempts/${id}/save`,
        {
          answers:
            mapAnswersArray(
              latestAnswers
            ),
          remainingSeconds: timeLeft,
        }
      );
    } catch (err) {
      console.error(
        "autosave failed",
        err
      );
    }
  }, [
    id,
    mapAnswersArray,
    timeLeft,
  ]);

  /*
  ========================================================
  Countdown timer
  ========================================================
  */
  useEffect(() => {
    if (
      timeLeft === null ||
      timeLeft === undefined ||
      !attempt
    ) {
      return;
    }

    if (timeLeft <= 0) return;

    const tick = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);

          if (
            !autoSubmitCalledRef.current
          ) {
            autoSubmitCalledRef.current = true;

            setTimeout(() => {
              /*
              IMPORTANT:
              We intentionally use the ref here
              so the auto submit gets the latest
              answers instead of an old closure.
              */
              if (
                handleAutoSubmitRef.current
              ) {
                handleAutoSubmitRef.current();
              }
            }, 0);
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () =>
      clearInterval(tick);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  /*
  ========================================================
  Heartbeat
  ========================================================
  */
  useEffect(() => {
    if (!attempt) return;

    heartbeatRef.current =
      setInterval(() => {
        api
          .post(
            `/api/attempts/${id}/ping`
          )
          .catch(() => {});
      }, 5000);

    return () => {
      clearInterval(
        heartbeatRef.current
      );
    };
  }, [attempt, id]);

  /*
  ========================================================
  Autosave every 10 seconds
  ========================================================
  */
  useEffect(() => {
    if (!attempt) return;

    autosaveRef.current =
      setInterval(() => {
        doAutosave();
      }, 10000);

    return () => {
      clearInterval(
        autosaveRef.current
      );
    };
  }, [attempt, doAutosave]);

  /*
  ========================================================
  Save before leaving page
  ========================================================
  */
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        /*
        IMPORTANT:
        Use the latest answers from the ref.
        */
        const latestAnswers =
          answersRef.current;

        const payload =
          JSON.stringify({
            answers:
              mapAnswersArray(
                latestAnswers
              ),
            remainingSeconds:
              timeLeft,
          });

        if (
          navigator.sendBeacon
        ) {
          const blob = new Blob(
            [payload],
            {
              type: "application/json",
            }
          );

          navigator.sendBeacon(
            `/api/attempts/${id}/save`,
            blob
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [
    mapAnswersArray,
    timeLeft,
    id,
  ]);

  /*
  ========================================================
  Select MCQ choice
  ========================================================
  */
  const selectChoice = (
    choiceIndex
  ) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,

        [currentQ]: {
          ...(prev[currentQ] || {}),

          choiceIndex,

          textAnswer:
            prev[currentQ]
              ?.textAnswer || "",

          imageUrl:
            prev[currentQ]
              ?.imageUrl || "",
        },
      };

      /*
      Keep ref synchronized immediately.
      */
      answersRef.current = updated;

      return updated;
    });
  };

  /*
  ========================================================
  Essay text answer
  ========================================================
  */
  const handleTextAnswer = (
    value
  ) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,

        [currentQ]: {
          ...(prev[currentQ] || {}),

          choiceIndex:
            prev[currentQ]
              ?.choiceIndex ?? null,

          textAnswer: value,

          imageUrl:
            prev[currentQ]
              ?.imageUrl || "",
        },
      };

      /*
      Keep ref synchronized immediately.
      */
      answersRef.current = updated;

      return updated;
    });
  };

  /*
  ========================================================
  Upload essay image
  ========================================================

  الصورة يتم رفعها فعليًا إلى:

  POST /api/upload

  وبعد نجاح الرفع نحفظ fileUrl
  داخل imageUrl.
  ========================================================
  */
  const handleImageUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    /*
    Only images
    */
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "من فضلك اختر ملف صورة فقط."
      );

      event.target.value = "";

      return;
    }

    /*
    Maximum 5 MB
    */
    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "حجم الصورة كبير جدًا. الحد الأقصى المسموح به 5 MB."
      );

      event.target.value = "";

      return;
    }

    try {
      setIsUploading(true);

      /*
      Create FormData
      */
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      /*
      Upload image
      */
      const res =
        await api.post(
          "/api/upload",
          formData
        );

      /*
      Get uploaded file URL
      */
      const fileUrl =
        res?.data?.fileUrl;

      if (!fileUrl) {
        throw new Error(
          "لم يتم استلام رابط الصورة من السيرفر."
        );
      }

      /*
      IMPORTANT:
      Build the complete updated answer
      first, then update both state and ref.
      */
      const previousAnswers =
        answersRef.current || {};

      const updatedAnswers = {
        ...previousAnswers,

        [currentQ]: {
          ...(previousAnswers[
            currentQ
          ] || {}),

          choiceIndex:
            previousAnswers[
              currentQ
            ]?.choiceIndex ?? null,

          textAnswer:
            previousAnswers[
              currentQ
            ]?.textAnswer || "",

          imageUrl: fileUrl,
        },
      };

      /*
      Update React state
      */
      setAnswers(updatedAnswers);

      /*
      Update ref immediately
      */
      answersRef.current =
        updatedAnswers;

      /*
      IMPORTANT:
      Save the NEW image URL directly.
      We do not wait for React state update.
      */
      try {
        await api.post(
          `/api/attempts/${id}/save`,
          {
            answers:
              mapAnswersArray(
                updatedAnswers
              ),
            remainingSeconds:
              timeLeft,
          }
        );
      } catch (saveError) {
        console.error(
          "Image answer save failed:",
          saveError
        );
      }
    } catch (err) {
      console.error(
        "Image upload failed:",
        err
      );

      const message =
        err?.response?.data
          ?.message ||
        "فشل رفع الصورة. حاول مرة أخرى.";

      alert(message);
    } finally {
      setIsUploading(false);

      /*
      Allow selecting same image again
      */
      event.target.value = "";
    }
  };

  /*
  ========================================================
  Remove uploaded image
  ========================================================
  */
  const removeImage = () => {
    setAnswers((prev) => {
      const updated = {
        ...prev,

        [currentQ]: {
          ...(prev[currentQ] || {}),

          choiceIndex:
            prev[currentQ]
              ?.choiceIndex ?? null,

          textAnswer:
            prev[currentQ]
              ?.textAnswer || "",

          imageUrl: "",
        },
      };

      /*
      Keep ref synchronized immediately.
      */
      answersRef.current = updated;

      return updated;
    });
  };

  /*
  ========================================================
  Build full image URL
  ========================================================
  */
  const getImageUrl = (
    imageUrl
  ) => {
    if (!imageUrl) return "";

    /*
    If already absolute URL
    */
    if (
      imageUrl.startsWith(
        "http://"
      ) ||
      imageUrl.startsWith(
        "https://"
      ) ||
      imageUrl.startsWith(
        "data:"
      ) ||
      imageUrl.startsWith(
        "blob:"
      )
    ) {
      return imageUrl;
    }

    /*
    Use API base URL
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
  ========================================================
  Navigation
  ========================================================
  */
  const gotoQuestion = (i) => {
    if (!exam) return;

    if (
      !exam.allowPrevious &&
      i < currentQ
    ) {
      alert(
        "الرجوع غير مسموح في هذا الامتحان."
      );

      return;
    }

    setCurrentQ(i);
  };

  /*
  ========================================================
  Next
  ========================================================
  */
  const handleNext = () => {
    if (!exam) return;

    if (
      currentQ <
      exam.questions.length - 1
    ) {
      setCurrentQ(
        currentQ + 1
      );
    } else {
      handleFinish();
    }
  };

  /*
  ========================================================
  Submit manually
  ========================================================
  */
  const handleFinish = async () => {
    if (isSubmitting) return;

    if (
      !areAllQuestionsAnswered()
    ) {
      alert(
        "يجب الإجابة على جميع الأسئلة قبل التسليم.\n\n" +
          "في السؤال المقالي يمكنك كتابة الإجابة أو رفع صورة للحل أو الاثنين معًا."
      );

      return;
    }

    if (isUploading) {
      alert(
        "انتظر حتى يكتمل رفع الصورة."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      /*
      Save latest answers first.

      Use answersRef to guarantee that the
      newest answer is submitted.
      */
      const latestAnswers =
        answersRef.current;

      await api.post(
        `/api/attempts/${id}/save`,
        {
          answers:
            mapAnswersArray(
              latestAnswers
            ),
          remainingSeconds:
            timeLeft,
        }
      );

      /*
      Submit
      */
      const res =
        await api.post(
          `/api/attempts/${id}/submit`
        );

      const {
        score,
        total,
        pendingEssayCount,
      } = res.data;

      navigate(
        `/student/exam-result/${id}`,
        {
          state: {
            score,
            total,
            pendingEssayCount:
              pendingEssayCount || 0,
          },
        }
      );
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data
          ?.message ||
        "فشل في إرسال الإجابة. حاول مرة أخرى.";

      alert(message);

      setIsSubmitting(false);
    }
  };

  /*
  ========================================================
  Automatic submit
  ========================================================
  */
  const handleAutoSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      /*
      IMPORTANT:
      Always use the latest answers from the ref.
      */
      const latestAnswers =
        answersRef.current;

      /*
      Save latest answers
      */
      await api.post(
        `/api/attempts/${id}/save`,
        {
          answers:
            mapAnswersArray(
              latestAnswers
            ),
          remainingSeconds: 0,
        }
      );

      /*
      Submit
      */
      const res =
        await api.post(
          `/api/attempts/${id}/submit`
        );

      const {
        score,
        total,
        pendingEssayCount,
      } = res.data;

      navigate(
        `/student/exam-result/${id}`,
        {
          state: {
            score,
            total,
            pendingEssayCount:
              pendingEssayCount || 0,
          },
        }
      );
    } catch (err) {
      console.error(err);

      navigate(
        `/student/exam-result/${id}`,
        {
          state: {
            score: 0,
            total:
              exam?.questions
                ?.length || 0,
          },
        }
      );
    }
  };

  /*
  ========================================================
  IMPORTANT:
  Keep the newest auto-submit function available
  to the countdown timer.
  ========================================================
  */
  const handleAutoSubmitRef =
    useRef(null);

  handleAutoSubmitRef.current =
    handleAutoSubmit;

  /*
  ========================================================
  Loading
  ========================================================
  */
  if (!exam || !attempt) {
    return (
      <div className="p-6 text-white">
        جاري التحميل...
      </div>
    );
  }

  const q =
    exam.questions[currentQ];

  const currentAnswer =
    answers[currentQ] || {};

  const formatTime = (
    secs
  ) => {
    if (
      secs === null ||
      secs === undefined
    ) {
      return "00:00";
    }

    const m = Math.floor(
      secs / 60
    )
      .toString()
      .padStart(2, "0");

    const s = (secs % 60)
      .toString()
      .padStart(2, "0");

    return `${m}:${s}`;
  };

  const answered =
    isQuestionAnswered(
      currentQ
    );

  /*
  Full image URL
  */
  const currentImageUrl =
    getImageUrl(
      currentAnswer.imageUrl
    );

  /*
  ========================================================
  Render
  ========================================================
  */
  return (
    <div
      className="p-6 text-white"
      dir="rtl"
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl text-yellow-400">
          {exam.title}
        </h1>

        <div className="bg-gray-800 p-2 rounded">
          الوقت المتبقي:{" "}
          <span
            className={`font-bold ${
              timeLeft <= 60
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {formatTime(
              timeLeft
            )}
          </span>
        </div>
      </div>

      {/* ================= QUESTION ================= */}
      <div className="bg-gray-900 p-6 rounded">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-300">
            السؤال{" "}
            {currentQ + 1} /{" "}
            {exam.questions.length}
          </p>

          <span
            className={`px-3 py-1 rounded text-sm ${
              answered
                ? "bg-green-700"
                : "bg-gray-700"
            }`}
          >
            {answered
              ? "تمت الإجابة"
              : "لم تتم الإجابة"}
          </span>
        </div>

        {/* Question type */}
        {q.type === "essay" ? (
          <div className="mb-4">
            <span className="inline-block bg-purple-700 px-3 py-1 rounded text-sm">
              سؤال مقالي
            </span>
          </div>
        ) : (
          <div className="mb-4">
            <span className="inline-block bg-blue-700 px-3 py-1 rounded text-sm">
              اختيار من متعدد
            </span>
          </div>
        )}

        {/* Question */}
        <p className="mb-6 text-lg leading-8">
          {q.questionText}
        </p>

        {/* ================= MCQ ================= */}
        {q.type === "mcq" && (
          <div className="space-y-2">
            {(q.choices || []).map(
              (c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    selectChoice(
                      idx
                    )
                  }
                  className={`block w-full p-3 rounded text-right transition ${
                    currentAnswer.choiceIndex ===
                    idx
                      ? "bg-green-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <span className="font-bold ml-2">
                    {String.fromCharCode(
                      65 + idx
                    )}
                    .
                  </span>

                  {c}
                </button>
              )
            )}
          </div>
        )}

        {/* ================= ESSAY ================= */}
        {q.type === "essay" && (
          <div className="space-y-6">
            {/* Text answer */}
            <div>
              <label className="block mb-2 text-yellow-400 font-bold">
                اكتب إجابتك:
              </label>

              <textarea
                value={
                  currentAnswer.textAnswer ||
                  ""
                }
                onChange={(e) =>
                  handleTextAnswer(
                    e.target.value
                  )
                }
                placeholder="اكتب إجابتك هنا..."
                rows={10}
                disabled={
                  isSubmitting
                }
                className="w-full bg-gray-800 border border-gray-700 rounded p-4 text-white resize-y focus:outline-none focus:border-yellow-500 disabled:opacity-60"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block mb-2 text-yellow-400 font-bold">
                أو ارفع صورة للحل:
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImageUpload
                }
                disabled={
                  isUploading ||
                  isSubmitting
                }
                className="block w-full text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded p-3 disabled:opacity-60"
              />

              <p className="text-gray-400 text-sm mt-2">
                يمكنك رفع صورة واضحة
                للحل، بحد أقصى 5 MB.
              </p>

              {isUploading && (
                <div className="mt-3 bg-blue-900/40 border border-blue-700 rounded p-3 text-blue-300">
                  جاري رفع الصورة...
                </div>
              )}
            </div>

            {/* Image preview */}
            {currentImageUrl && (
              <div className="bg-gray-800 rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-green-400">
                    تم رفع صورة الحل
                  </span>

                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                    disabled={
                      isSubmitting ||
                      isUploading
                    }
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    حذف الصورة
                  </button>
                </div>

                <div className="bg-gray-950 rounded p-3">
                  <img
                    src={
                      currentImageUrl
                    }
                    alt="صورة حل الطالب"
                    className="max-w-full max-h-[500px] mx-auto rounded object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= NAVIGATION ================= */}
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={() =>
              gotoQuestion(
                Math.max(
                  0,
                  currentQ - 1
                )
              )
            }
            disabled={
              currentQ === 0 ||
              isSubmitting
            }
            className="px-4 py-2 bg-yellow-600 rounded disabled:opacity-40"
          >
            السابق
          </button>

          <button
            type="button"
            onClick={
              handleNext
            }
            disabled={
              isSubmitting ||
              isUploading
            }
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-40"
          >
            {currentQ <
            exam.questions.length -
              1
              ? "التالي"
              : "إنهاء"}
          </button>

          <button
            type="button"
            onClick={
              handleFinish
            }
            disabled={
              isSubmitting ||
              isUploading
            }
            className="mr-auto bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:opacity-40"
          >
            {isSubmitting
              ? "جاري التسليم..."
              : "تسليم"}
          </button>
        </div>
      </div>

      {/* ================= QUESTION NAVIGATION ================= */}
      <div className="mt-6">
        <h3 className="text-yellow-400 mb-3">
          انتقل إلى سؤال:
        </h3>

        <div className="flex gap-2 flex-wrap">
          {exam.questions.map(
            (question, i) => {
              const questionAnswered =
                isQuestionAnswered(
                  i
                );

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    gotoQuestion(
                      i
                    )
                  }
                  className={`w-10 h-10 rounded font-bold ${
                    currentQ === i
                      ? "ring-2 ring-yellow-400"
                      : ""
                  } ${
                    questionAnswered
                      ? "bg-green-600"
                      : "bg-gray-700"
                  }`}
                  title={
                    question.type ===
                    "essay"
                      ? "سؤال مقالي"
                      : "اختيار من متعدد"
                  }
                >
                  {i + 1}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ================= SUBMISSION INFO ================= */}
      <div className="mt-6 bg-gray-800 rounded p-4 text-gray-300">
        <p>
          الأسئلة الخضراء تم
          الإجابة عنها.
        </p>

        <p className="mt-1">
          في السؤال المقالي يمكنك
          كتابة الإجابة أو رفع صورة
          للحل أو استخدام الاثنين
          معًا.
        </p>
      </div>
    </div>
  );
}