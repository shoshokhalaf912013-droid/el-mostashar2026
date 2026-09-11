import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivateCourses() {
  const navigate = useNavigate();

  const courses = [
    {
      title: "تأسيس نحو",
      desc: "شرح قواعد اللغة العربية من الصفر حتى الإتقان",
      path: "nahw",
    },
    {
      title: "قراءة إنجليزي",
      desc: "تحسين مهارات القراءة والفهم باللغة الإنجليزية",
      path: "english-reading",
    },
    {
      title: "دورات تحسين الخط",
      desc: "تحسين خط اليد العربي بأسلوب عملي وتدريجي",
      path: "handwriting",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-yellow-400 text-center mb-10">
        الكورسات الخاصة
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <div
            key={i}
            onClick={() =>
              navigate(`/student/private-courses/${course.path}`)
            }
            className="
              bg-[#111]
              border border-yellow-600
              rounded-2xl
              p-6
              cursor-pointer
              transition-all
              duration-300
              hover:scale-105
              hover:-translate-y-1
              hover:shadow-yellow-600/40
            "
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-3">
              {course.title}
            </h2>
            <p className="text-gray-300">{course.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={() => navigate("/student/select-stage")}
          className="text-yellow-400 hover:text-yellow-300"
        >
          ← الرجوع لاختيار المرحلة
        </button>
      </div>
    </div>
  );
}
