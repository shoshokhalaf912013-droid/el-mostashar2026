// src/pages/SuperAdmin/AddExam.jsx
import React, { useState } from "react";
import api from "../../utils/api";

export default function AddExam() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  const addQuestion = () => {
    setQuestions((q) => [
      ...q,
      {
        questionText: "",
        choices: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const updateChoice = (qIndex, cIndex, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const choices = [...copy[qIndex].choices];

      choices[cIndex] = value;

      copy[qIndex] = {
        ...copy[qIndex],
        choices,
      };

      return copy;
    });
  };

  const submitExam = async () => {
    // validation minimal
    if (!title.trim()) {
      return alert("اكتب عنوان الامتحان");
    }

    if (!subject.trim()) {
      return alert("اكتب المادة");
    }

    try {
      const payload = {
        title,
        subject,
        duration: Number(duration),
        questions,
      };

      await api.post("/api/exams", payload);

      alert("تم إنشاء الامتحان بنجاح!");

      setTitle("");
      setSubject("");
      setDuration(30);

      setQuestions([
        {
          questionText: "",
          choices: ["", "", "", ""],
          correctAnswer: 0,
        },
      ]);
    } catch (err) {
      console.error("Error creating exam:", err);
      alert("حدث خطأ أثناء إرسال الامتحان");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">
        إضافة امتحان جديد
      </h1>

      <div className="space-y-3">
        <input
          className="p-2 bg-gray-800 w-full"
          placeholder="عنوان الامتحان"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="p-2 bg-gray-800 w-full"
          placeholder="المادة"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          className="p-2 bg-gray-800 w-full"
          type="number"
          placeholder="المدة بالدقائق"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <h2 className="text-yellow-300 text-xl my-3">
          الأسئلة
        </h2>

        {questions.map((q, i) => (
          <div
            key={i}
            className="bg-gray-900 p-4 rounded-lg mb-3"
          >
            <input
              className="p-2 bg-gray-800 w-full mb-2"
              placeholder={`السؤال ${i + 1}`}
              value={q.questionText}
              onChange={(e) =>
                updateQuestion(
                  i,
                  "questionText",
                  e.target.value
                )
              }
            />

            {q.choices.map((c, ci) => (
              <input
                key={ci}
                className="p-2 bg-gray-800 w-full mb-1"
                placeholder={`الاختيار ${ci + 1}`}
                value={c}
                onChange={(e) =>
                  updateChoice(
                    i,
                    ci,
                    e.target.value
                  )
                }
              />
            ))}

            <label className="text-gray-300 mt-2 block">
              الإجابة الصحيحة (0-3):
            </label>

            <input
              className="p-2 bg-gray-800 w-full"
              type="number"
              min={0}
              max={3}
              value={q.correctAnswer}
              onChange={(e) =>
                updateQuestion(
                  i,
                  "correctAnswer",
                  Number(e.target.value)
                )
              }
            />
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="bg-blue-600 p-2 mt-3 rounded w-full"
        >
          ➕ إضافة سؤال
        </button>

        <button
          onClick={submitExam}
          className="bg-green-600 p-2 mt-4 rounded w-full"
        >
          ✔ حفظ الامتحان
        </button>
      </div>
    </div>
  );
}