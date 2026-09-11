import React, { useState, useEffect } from "react";

export default function Exam() {
  const [timeLeft, setTimeLeft] = useState(600); // 10 دقائق
  const [answers, setAnswers] = useState({});
  const questions = [
    {
      id: 1,
      question: "من هو مؤسس الدولة الحديثة في مصر؟",
      options: ["محمد علي", "سعد زغلول", "أحمد عرابي", "توفيق باشا"],
      correct: "محمد علي",
    },
    {
      id: 2,
      question: "متى بدأت الحملة الفرنسية على مصر؟",
      options: ["1798", "1882", "1805", "1840"],
      correct: "1798",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (id, option) => {
    setAnswers({ ...answers, [id]: option });
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) score++;
    });
    alert(`تم إرسال إجابتك ✅\nالنتيجة: ${score}/${questions.length}`);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-2xl mx-auto text-center text-white">
      <h2 className="text-3xl font-bold text-[var(--gold)] mb-6">
        اختبار سريع 🧠
      </h2>
      <p className="text-lg mb-4 text-red-500">
        الوقت المتبقي: {minutes}:{seconds < 10 ? "0" : ""}{seconds}
      </p>
      <form className="space-y-6">
        {questions.map((q) => (
          <div
            key={q.id}
            className="bg-gray-900 p-4 rounded-xl border border-[var(--gold)]"
          >
            <h3 className="font-semibold mb-3">{q.question}</h3>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`cursor-pointer p-2 rounded-md border ${
                    answers[q.id] === opt
                      ? "bg-[var(--gold)] text-black"
                      : "border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    className="hidden"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-6 px-6 py-2 bg-[var(--gold)] text-black rounded-lg font-bold hover:bg-yellow-500 transition"
        >
          إرسال الإجابات
        </button>
      </form>
    </div>
  );
}
