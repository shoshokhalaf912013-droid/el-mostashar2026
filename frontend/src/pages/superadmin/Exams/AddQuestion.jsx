import React, { useState } from "react";
import { db } from "../../../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function AddQuestion() {
  const [examId, setExamId] = useState("");
  const [question, setQuestion] = useState("");
  const [answerA, setAnswerA] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [answerC, setAnswerC] = useState("");
  const [answerD, setAnswerD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  const handleAddQuestion = async () => {
    if (!examId || !question || !correctAnswer) {
      alert("يجب إدخال كل الحقول المطلوبة");
      return;
    }

    try {
      const examRef = doc(db, "exams", examId);

      await updateDoc(examRef, {
        questions: arrayUnion({
          question,
          options: { A: answerA, B: answerB, C: answerC, D: answerD },
          correctAnswer,
        }),
      });

      alert("تم إضافة السؤال بنجاح!");

      setQuestion("");
      setAnswerA("");
      setAnswerB("");
      setAnswerC("");
      setAnswerD("");
      setCorrectAnswer("");

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الإضافة");
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">إضافة سؤال جديد</h1>

      <div className="space-y-4">

        <input
          className="w-full p-3 bg-gray-800 rounded"
          placeholder="رقم الامتحان Exam ID"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
        />

        <input
          className="w-full p-3 bg-gray-800 rounded"
          placeholder="نص السؤال"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <input
          className="w-full p-3 bg-gray-800 rounded"
          placeholder="الإجابة A"
          value={answerA}
          onChange={(e) => setAnswerA(e.target.value)}
        />

        <input
          className="w-full p-3 bg-gray-800 rounded"
          placeholder="الإجابة B"
          value={answerB}
          onChange={(e) => setAnswerB(e.target.value)}
        />

        <input
          className="w-full p-3 bg-gray-800 rounded"
          placeholder="الإجابة C"
          value={answerC}
          onChange={(e) => setAnswerC(e.target.value)}
        />

        <input
          className="w-full p-3 bg-gray-800 rounded"
          placeholder="الإجابة D"
          value={answerD}
          onChange={(e) => setAnswerD(e.target.value)}
        />

        <input
          className="w-full p-3 bg-gray-800 rounded"
          placeholder="الإجابة الصحيحة (A/B/C/D)"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        />

        <button
          onClick={handleAddQuestion}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded mt-4"
        >
          إضافة السؤال
        </button>
      </div>
    </div>
  );
}
