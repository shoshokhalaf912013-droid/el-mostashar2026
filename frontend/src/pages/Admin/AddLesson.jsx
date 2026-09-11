import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddLesson = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState(null);
  const [video, setVideo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, pdf, video });
    alert("تمت إضافة الدرس بنجاح (Admin)");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen pt-24">
      <h2 className="text-2xl font-bold mb-4">إضافة درس - Admin</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md space-y-4"
      >
        <div>
          <label className="block font-semibold mb-1">عنوان الدرس</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">ملف PDF</label>
          <input
            type="file"
            accept="application/pdf"
            className="w-full"
            onChange={(e) => setPdf(e.target.files[0])}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">رابط الفيديو</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-yellow-500 text-black px-4 py-2 rounded font-bold"
          >
            إضافة الدرس
          </button>

          {/* ✅ زر تثبيت الكويز ككيان تابع للدرس */}
          <button
            type="button"
            className="bg-purple-600 text-white px-4 py-2 rounded font-bold"
            onClick={() => {
              alert("كويز هذا الدرس (سيتم استكماله لاحقًا)");
              // لاحقًا: navigate(`/admin/lessons/:lessonId/quiz`)
            }}
          >
            كويز هذا الدرس
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLesson;
