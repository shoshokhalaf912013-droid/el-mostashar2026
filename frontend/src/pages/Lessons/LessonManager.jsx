import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LessonManager() {
  const { role } = useAuth();
  const navigate = useNavigate();

  /* ================= الصلاحيات النهائية ================= */
  const canEdit =
    role === "teacher" || role === "admin" || role === "super-admin";

  const canApprove =
    role === "admin" || role === "super-admin";

  // ❌ الحذف للسوبر أدمن فقط
  const canDelete =
    role === "super-admin";

  /* ================== البيانات ================== */
  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: "الوحدة الأولى – الدرس الأول",
      status: "draft", // draft | approved | disabled
    },
  ]);

  const [newLessonTitle, setNewLessonTitle] = useState("");

  /* ================== العمليات ================== */
  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) return;

    setLessons([
      ...lessons,
      {
        id: Date.now(),
        title: newLessonTitle,
        status: "draft",
      },
    ]);

    setNewLessonTitle("");
  };

  const approveLesson = (id) => {
    setLessons(
      lessons.map((l) =>
        l.id === id ? { ...l, status: "approved" } : l
      )
    );
  };

  const disableLesson = (id) => {
    setLessons(
      lessons.map((l) =>
        l.id === id ? { ...l, status: "disabled" } : l
      )
    );
  };

  const deleteLesson = (id) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  /* ================== الواجهة ================== */
  return (
    <div className="min-h-screen bg-black text-white p-8" dir="rtl">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
        إدارة الدروس
      </h1>

      {/* ===== إضافة درس ===== */}
      {canEdit && (
        <div className="bg-[#111] p-6 rounded-xl border border-gray-700 mb-10">
          <h2 className="text-lg font-bold mb-4 text-green-400">
            ➕ إضافة درس جديد
          </h2>

          <div className="flex gap-4">
            <input
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="عنوان الدرس"
              className="flex-1 p-2 rounded bg-black border border-gray-600"
            />
            <button
              onClick={handleAddLesson}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              إضافة
            </button>
          </div>
        </div>
      )}

      {/* ===== قائمة الدروس ===== */}
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-[#111] p-5 rounded-xl border border-gray-700"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">{lesson.title}</h3>

              <span
                className={`text-sm px-3 py-1 rounded
                  ${
                    lesson.status === "approved"
                      ? "bg-green-700"
                      : lesson.status === "disabled"
                      ? "bg-red-700"
                      : "bg-gray-700"
                  }
                `}
              >
                {lesson.status === "draft"
                  ? "مسودة"
                  : lesson.status === "approved"
                  ? "معتمد"
                  : "معطل"}
              </span>
            </div>

            {/* ===== الأزرار حسب الدور ===== */}
            <div className="flex gap-3 flex-wrap">
              {/* تعديل / كويز */}
              {canEdit && (
                <>
                  <button className="px-3 py-1 bg-blue-600 rounded">
                    ✏️ تعديل
                  </button>

                  {/* ✅ الكويز → صفحة الإدارة */}
                  <button
                    onClick={() =>
                      navigate(`/lessons/exam/${lesson.id}/manage`)
                    }
                    className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
                  >
                    🧠 كويز هذا الدرس
                  </button>
                </>
              )}

              {/* اعتماد / تعطيل */}
              {canApprove && lesson.status !== "approved" && (
                <button
                  onClick={() => approveLesson(lesson.id)}
                  className="px-3 py-1 bg-green-600 rounded"
                >
                  ✔️ اعتماد
                </button>
              )}

              {canApprove && (
                <button
                  onClick={() => disableLesson(lesson.id)}
                  className="px-3 py-1 bg-yellow-600 rounded"
                >
                  ⛔ تعطيل
                </button>
              )}

              {/* حذف (سوبر أدمن فقط) */}
              {canDelete && (
                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="px-3 py-1 bg-red-600 rounded"
                >
                  🗑️ حذف
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
