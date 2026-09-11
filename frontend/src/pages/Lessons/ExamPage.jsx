import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

import "../../styles/sa-student.css";
import "../Student/styles/exam.css"; // ✅ المسار الصحيح

const ExamPage = () => {
  const { id: examId } = useParams();

  // ⚠️ مؤقت — لاحقًا من auth
  const userId = "temp-student-id";

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= جلب الامتحان ================= */
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const ref = doc(db, "exams", examId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setExam(snap.data());
        } else {
          alert("الامتحان غير موجود");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchExam();
  }, [examId]);

  /* ================= اختيار إجابة ================= */
  const handleSelect = (qIndex, choice) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: choice,
    }));
  };

  /* ================= إرسال + حفظ ================= */
  const handleSubmit = async () => {
    if (!exam?.questions?.length) return;

    let correct = 0;

    exam.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });

    const result = {
      correct,
      total: exam.questions.length,
      percent: Math.round(
        (correct / exam.questions.length) * 100
      ),
    };

    try {
      await setDoc(
        doc(db, "exams", examId, "submissions", userId),
        {
          answers,
          score: result,
          submittedAt: serverTimestamp(),
        }
      );

      setScore(result);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء حفظ الإجابات");
    }
  };

  if (loading) {
    return <div className="exam-loading">جار تحميل الامتحان...</div>;
  }

  if (!exam) {
    return <div className="exam-loading">لم يتم العثور على الامتحان</div>;
  }

  return (
    <div className="exam-container">
      <h2 className="exam-title">
        {exam.title || "امتحان على الدرس"}
      </h2>

      {exam.description && (
        <p className="exam-desc">{exam.description}</p>
      )}

      {!submitted ? (
        <div className="exam-questions">
          {exam.questions?.map((q, index) => (
            <div key={index} className="exam-question-box">
              <h3 className="exam-question">
                {index + 1}. {q.question}
              </h3>

              <div className="exam-choices">
                {Object.entries(q.options).map(
                  ([key, value]) => (
                    <label key={key} className="exam-choice">
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={key}
                        onChange={() =>
                          handleSelect(index, key)
                        }
                      />
                      <span>
                        {key}. {value}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          ))}

          <button
            className="exam-submit-btn"
            onClick={handleSubmit}
          >
            إرسال الامتحان
          </button>
        </div>
      ) : (
        <div className="exam-result-box">
          <h3>تم إرسال الامتحان بنجاح ✔</h3>

          {score && (
            <div className="mt-4 text-center">
              <p className="text-lg font-bold">
                الدرجة: {score.correct} / {score.total}
              </p>
              <p className="text-md mt-2">
                النسبة:{" "}
                <span className="font-bold text-yellow-400">
                  {score.percent}%
                </span>
              </p>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-400">
            تم حفظ إجاباتك بنجاح.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
