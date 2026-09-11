import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LessonEditor() {
  const navigate = useNavigate();

  /* =================== States =================== */
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [videoLink, setVideoLink] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);

  /* =================== Quiz Logic =================== */
  const addQuestion = () => {
    setQuiz([
      ...quiz,
      {
        id: Date.now(),
        question: "",
        options: ["", "", "", ""],
        correct: null,
      },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuiz(
      quiz.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (qId, index, value) => {
    setQuiz(
      quiz.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o, i) =>
                i === index ? value : o
              ),
            }
          : q
      )
    );
  };

  /* =================== Save (Placeholder) =================== */
  const handleSave = () => {
    if (!title) {
      alert("اكتب عنوان الدرس");
      return;
    }

    if (!videoLink && !pdfFile) {
      alert("يجب إضافة فيديو أو PDF");
      return;
    }

    const lessonData = {
      title,
      content,
      videoLink,
      pdfFile,
      quiz,
    };

    console.log("LESSON DATA:", lessonData);
    alert("تم حفظ الدرس (مبدئيًا)");
    navigate(-1);
  };

  /* =================== UI =================== */
  return (
    <div className="min-h-screen bg-black text-white p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-yellow-400 mb-8">
        إنشاء درس جديد
      </h1>

      {/* ===== عنوان الدرس ===== */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان الدرس"
        className="w-full p-4 mb-6 bg-[#111] border border-gray-700 rounded text-lg"
      />

      {/* ===== محتوى نصي ===== */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="محتوى الدرس (اختياري)"
        className="w-full p-4 mb-6 bg-[#111] border border-gray-700 rounded h-32"
      />

      {/* ===== فيديو ===== */}
      <input
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
        placeholder="رابط الفيديو (YouTube مثلاً)"
        className="w-full p-4 mb-4 bg-[#111] border border-gray-700 rounded"
      />

      {/* ===== PDF ===== */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
        className="w-full p-3 mb-8 bg-[#111] border border-gray-700 rounded"
      />

      {/* ===== كويز ===== */}
      <button
        onClick={() => setShowQuiz(true)}
        className="mb-6 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
      >
        🧠 إضافة كويز
      </button>

      {showQuiz && (
        <div className="space-y-6">
          {quiz.map((q, qi) => (
            <div
              key={q.id}
              className="bg-[#111] border border-gray-700 rounded p-5"
            >
              <input
                value={q.question}
                onChange={(e) =>
                  updateQuestion(q.id, "question", e.target.value)
                }
                placeholder={`سؤال ${qi + 1}`}
                className="w-full p-3 mb-4 bg-black border border-gray-600 rounded"
              />

              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    checked={q.correct === i}
                    onChange={() =>
                      updateQuestion(q.id, "correct", i)
                    }
                  />
                  <input
                    value={opt}
                    onChange={(e) =>
                      updateOption(q.id, i, e.target.value)
                    }
                    placeholder={`اختيار ${i + 1}`}
                    className="flex-1 p-2 bg-black border border-gray-600 rounded"
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            + إضافة سؤال
          </button>
        </div>
      )}

      {/* ===== حفظ ===== */}
      <div className="mt-10 flex gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-green-600 rounded hover:bg-green-700"
        >
          💾 حفظ الدرس
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gray-700 rounded"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
