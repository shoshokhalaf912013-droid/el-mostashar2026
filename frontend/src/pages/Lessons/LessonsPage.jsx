import React from "react";
import { Link, useParams } from "react-router-dom";

const LessonsPage = () => {
  const { gradeId, subject } = useParams();

  // 🔹 داتا مؤقتة (كما هو وضع المنصة الآن)
  const lessons = [
    { id: 1, title: "الدرس الأول" },
    { id: 2, title: "الدرس الثاني" },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* 🟡 في حالة الدخول بدون مادة */}
      {!subject ? (
        <div className="flex flex-col items-center justify-center mt-24 text-gray-400">
          <h2 className="text-2xl mb-4 text-yellow-400">
            الدروس
          </h2>
          <p className="text-lg">
            اختر مادة لعرض دروسها
          </p>
        </div>
      ) : (
        <>
          {/* عنوان المادة */}
          <h1 className="text-3xl font-bold text-yellow-400 mb-4 text-center">
            {decodeURIComponent(subject)}
          </h1>

          {/* الصف (معلومة فقط – بدون تحقق) */}
          {gradeId && (
            <p className="text-center text-gray-400 mb-10">
              الصف: <span className="text-white">{gradeId}</span>
            </p>
          )}

          {/* إضافة درس */}
          <div className="text-center mb-10">
            <Link
              to="add"
              className="inline-block px-6 py-3 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition"
            >
              إضافة درس جديد
            </Link>
          </div>

          {/* قائمة الدروس */}
          <ul className="max-w-3xl mx-auto space-y-4">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="border border-gray-700 rounded-xl p-5 hover:border-yellow-500 transition"
              >
                <Link
                  to={`${lesson.id}`}
                  className="block text-lg text-white"
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default LessonsPage;
