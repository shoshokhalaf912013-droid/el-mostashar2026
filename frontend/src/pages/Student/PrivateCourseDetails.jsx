import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const PRIVATE_COURSES = {
  nahw: {
    title: "تأسيس نحو",
    teacher: "أ/ محمد عبد الله",

    videoFile: "/videos/nahw-intro.mp4",
    videoLink: "https://www.youtube.com/",

    pdfs: [
      { name: "ملف الشرح الأساسي", url: "#" },
      { name: "تدريبات على النحو", url: "#" },
    ],
  },

  "english-reading": {
    title: "قراءة إنجليزي",
    teacher: "أ/ Sarah Ahmed",

    videoLink: "https://www.youtube.com/",

    pdfs: [
      { name: "Reading Basics", url: "#" },
    ],
  },

  handwriting: {
    title: "تحسين الخط",
    teacher: "أ/ أحمد حسن",

    videoFile: "/videos/handwriting.mp4",

    pdfs: [
      { name: "كراسة الخط", url: "#" },
    ],
  },
};

export default function PrivateCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const course = PRIVATE_COURSES[courseId];

  if (!course) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-red-500 text-xl mb-4">
          الكورس غير موجود
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-yellow-400 underline"
        >
          الرجوع
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-extrabold text-yellow-400 text-center mb-2">
        {course.title}
      </h1>

      <p className="text-center text-gray-400 mb-8">
        المعلم: {course.teacher}
      </p>

      {course.videoFile && (
        <div className="max-w-3xl mx-auto mb-8 bg-[#111] border border-yellow-700 rounded-xl p-4">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">
            فيديو الشرح
          </h2>

          <video
            src={course.videoFile}
            controls
            className="w-full rounded-lg"
          />
        </div>
      )}

      {course.videoLink && (
        <div className="max-w-3xl mx-auto mb-8 bg-[#111] border border-yellow-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">
            رابط الشرح
          </h2>

          <a
            href={course.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline break-all"
          >
            {course.videoLink}
          </a>
        </div>
      )}

      {course.pdfs?.length > 0 && (
        <div className="max-w-3xl mx-auto bg-[#111] border border-yellow-700 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            ملفات PDF
          </h2>

          {course.pdfs.map((pdf, index) => (
            <div key={index} className="mb-2">
              <a
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-yellow-400 transition"
              >
                📄 {pdf.name}
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ⬅ الرجوع
        </button>
      </div>

    </div>
  );
}
