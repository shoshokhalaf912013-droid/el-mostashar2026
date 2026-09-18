import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

import "../../styles/sa-student.css";
import "./styles/exam.css";

const ExamPage = () => {
  const { id: examId } = useParams();
  const { currentUser } = useAuth();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);

  /* ================= تحميل الامتحان من MongoDB ================= */

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;

      try {
        setLoading(true);

        const res = await api.get(
          `/api/exams/${examId}`
        );

        const data = res.data?.exam;

        if (!data) {
          console.error(
            "Exam not found:",
            res.data
          );

          setExam(null);
          return;
        }

        /*
         * الامتحان الموجود في MongoDB يستخدم:
         *
         * questionText
         * choices
         * correctAnswer = رقم الاختيار
         */

        setExam(data);

      } catch (error) {
        console.error(
          "Error loading exam:",
          error
        );

        setExam(null);

      } finally {
        setLoading(false);
      }
    };

    fetchExam();

  }, [examId]);

  /* ================= منع إعادة دخول الامتحان ================= */

  useEffect(() => {
    if (!examId) return;

    /*
     * إذا كانت هناك نتيجة محفوظة لهذا الامتحان على هذا المتصفح،
     * فلا نعيد فتح الامتحان عند عمل Refresh.
     *
     * النتيجة الحالية محفوظة محليًا كما هو مطبق في handleSubmit.
     */
    const savedResult = localStorage.getItem(
      `exam_result_${examId}`
    );

    if (savedResult) {
      try {
        const result = JSON.parse(savedResult);

        setAnswers({});
        setSubmitted(true);

        console.log(
          "Exam already completed:",
          result
        );
      } catch (error) {
        console.error(
          "Invalid saved exam result:",
          error
        );

        localStorage.removeItem(
          `exam_result_${examId}`
        );
      }
    }
  }, [examId]);

  /* ================= بدء الامتحان ================= */

  useEffect(() => {
    if (!exam) return;

    const storageKey =
      `exam_start_${examId}`;

    const savedStart =
      localStorage.getItem(storageKey);

    if (savedStart) {
      setStartTime(
        Number(savedStart)
      );
    } else {
      const now = Date.now();

      localStorage.setItem(
        storageKey,
        String(now)
      );

      setStartTime(now);
    }

  }, [exam, examId]);

  /* ================= المؤقت ================= */

  useEffect(() => {
    if (
      !startTime ||
      !exam?.duration ||
      submitted
    ) {
      return;
    }

    const interval =
      setInterval(() => {

        const now = Date.now();

        const diff = Math.floor(
          (now - startTime) / 1000
        );

        const remaining =
          exam.duration * 60 - diff;

        if (remaining <= 0) {
          clearInterval(interval);

          setTimeLeft(0);

          handleSubmit();

        } else {
          setTimeLeft(remaining);
        }

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [
    startTime,
    exam,
    submitted
  ]);

  /* ================= اختيار الإجابة ================= */

  const handleSelect = (
    questionIndex,
    choiceIndex
  ) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]:
        choiceIndex
    }));
  };

  /* ================= إرسال الامتحان ================= */

  const handleSubmit = async () => {
    if (
      submitted ||
      !exam
    ) {
      return;
    }

    let score = 0;

    exam.questions.forEach(
      (question, index) => {

        const selected =
          answers[index];

        if (
          selected !== undefined &&
          Number(selected) ===
            Number(
              question.correctAnswer
            )
        ) {
          score++;
        }

      }
    );

    console.log(
      "Exam result:",
      {
        examId,
        score,
        total:
          exam.questions.length
      }
    );

    /*
     * نحفظ النتيجة مؤقتًا في localStorage
     * حتى لا نربط نتيجة الامتحان بقاعدة أخرى
     * قبل التأكد من الـBackend.
     */

    const result = {
      examId,
      userId:
        currentUser?.uid || null,
      score,
      total:
        exam.questions.length,
      createdAt:
        Date.now()
    };

    localStorage.setItem(
      `exam_result_${examId}`,
      JSON.stringify(result)
    );

    setSubmitted(true);

    localStorage.removeItem(
      `exam_start_${examId}`
    );
  };

  /* ================= منع الرجوع أثناء الامتحان ================= */

  useEffect(() => {
    if (!exam || submitted) return;

    window.history.pushState(
      null,
      "",
      window.location.href
    );

    const handlePopState = () => {
      window.history.pushState(
        null,
        "",
        window.location.href
      );
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };

  }, [exam, submitted]);

  /* ================= مراقبة الخروج من الصفحة ================= */

  useEffect(() => {
    if (!exam || submitted) return;

    const handleBlur = () => {
      console.log(
        "الطالب خرج من نافذة الامتحان"
      );
    };

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      window.removeEventListener(
        "blur",
        handleBlur
      );
    };

  }, [exam, submitted]);

  /* ================= Loading ================= */

  if (loading) {
    return (
      <div className="exam-loading">
        جاري تحميل الامتحان...
      </div>
    );
  }

  /* ================= Exam Not Found ================= */

  if (!exam) {
    return (
      <div className="exam-loading">
        لم يتم العثور على الامتحان
      </div>
    );
  }

  /* ================= النتيجة ================= */

  if (submitted) {
    const score =
      exam.questions.reduce(
        (total, question, index) => {

          if (
            Number(
              answers[index]
            ) ===
            Number(
              question.correctAnswer
            )
          ) {
            return total + 1;
          }

          return total;

        },
        0
      );

    return (
      <div className="exam-container">

        <h2 className="exam-title">
          {exam.title}
        </h2>

        <div className="exam-result-box">

          <h3>
            تم إنهاء الامتحان بنجاح 🎉
          </h3>

          <p>
            نتيجتك:
          </p>

          <p
            style={{
              fontSize: "32px",
              color: "#FFD700",
              fontWeight: "bold"
            }}
          >
            {score} /{" "}
            {exam.questions.length}
          </p>

          <p>
            الدرجة:
            {" "}
            {Math.round(
              (score /
                exam.questions.length) *
                100
            )}
            %
          </p>

        </div>

      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="exam-container">

      {/* ================= العنوان ================= */}

      <h2 className="exam-title">
        {exam.title}
      </h2>

      {/* ================= البيانات ================= */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#ddd"
        }}
      >

        <p>
          المادة:{" "}
          {exam.subject === "history"
            ? "التاريخ"
            : exam.subject}
        </p>

        <p>
          الصف:{" "}
          {exam.gradeId === "sec1"
            ? "الصف الأول الثانوي"
            : exam.gradeId}
        </p>

        <p>
          عدد الأسئلة:{" "}
          {exam.questions.length}
        </p>

        <p>
          مدة الامتحان:{" "}
          {exam.duration} دقيقة
        </p>

      </div>

      {/* ================= المؤقت ================= */}

      <p
        style={{
          color: "#FFD700",
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "25px"
        }}
      >
        الوقت المتبقي:{" "}
        {Math.floor(
          timeLeft / 60
        )}
        :
        {(
          "0" +
          (timeLeft % 60)
        ).slice(-2)}
      </p>

      {/* ================= الأسئلة ================= */}

      <div className="exam-questions">

        {exam.questions?.map(
          (question, index) => (

            <div
              key={
                question._id ||
                index
              }
              className="exam-question-box"
            >

              {/* السؤال */}

              <h3 className="exam-question">

                {index + 1}.{" "}

                {question.questionText}

              </h3>

              {/* الاختيارات */}

              <div className="exam-choices">

                {question.choices?.map(
                  (choice, choiceIndex) => (

                    <label
                      key={
                        choiceIndex
                      }
                      className="exam-choice"
                    >

                      <input
                        type="radio"
                        name={`question-${index}`}
                        checked={
                          Number(
                            answers[index]
                          ) ===
                          choiceIndex
                        }
                        onChange={() =>
                          handleSelect(
                            index,
                            choiceIndex
                          )
                        }
                      />

                      <span>
                        {
                          [
                            "أ",
                            "ب",
                            "ج",
                            "د"
                          ][choiceIndex]
                        }
                        .{" "}
                        {choice}
                      </span>

                    </label>

                  )
                )}

              </div>

            </div>

          )
        )}

        {/* ================= إرسال ================= */}

        <button
          className="exam-submit-btn"
          onClick={handleSubmit}
        >
          إرسال الامتحان
        </button>

      </div>

    </div>
  );
};

export default ExamPage;