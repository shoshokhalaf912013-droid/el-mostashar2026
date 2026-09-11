import React, { useEffect, useState } from "react";
import { Save, XCircle } from "lucide-react";
import { useParams } from "react-router-dom";

export default function EditLesson() {
  const { id } = useParams(); // معرف الدرس
  const [loading, setLoading] = useState(true);

  const [lessonData, setLessonData] = useState({
    title: "",
    subject: "",
    grade: "",
    videoUrl: "",
    description: "",
  });

  // محاكاة جلب بيانات الدرس
  useEffect(() => {
    setTimeout(() => {
      setLessonData({
        title: "درس المحاليل المائية",
        subject: "الكيمياء",
        grade: "الصف الثاني الثانوي",
        videoUrl: "https://youtube.com/example",
        description: "شرح كامل لأساسيات المحاليل المائية.",
      });
      setLoading(false);
    }, 400);
  }, [id]);

  const handleChange = (e) => {
    setLessonData({ ...lessonData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("تم تعديل الدرس:", lessonData);
    alert("تم حفظ التعديلات بنجاح ✔️");
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg animate-pulse">
        جاري تحميل بيانات الدرس...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">تعديل الدرس</h1>

      <div className="bg-white shadow rounded-2xl p-6">

        {/* عنوان الدرس */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">عنوان الدرس</label>
          <input
            name="title"
            type="text"
            value={lessonData.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* المادة */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">المادة</label>
          <input
            name="subject"
            type="text"
            value={lessonData.subject}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* الصف الدراسي */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">الصف الدراسي</label>
          <select
            name="grade"
            value={lessonData.grade}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option>الصف الأول الثانوي</option>
            <option>الصف الثاني الثانوي</option>
            <option>الصف الثالث الثانوي</option>
          </select>
        </div>

        {/* رابط الفيديو */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">رابط الفيديو</label>
          <input
            name="videoUrl"
            type="text"
            value={lessonData.videoUrl}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* الوصف */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">وصف الدرس</label>
          <textarea
            name="description"
            rows="4"
            value={lessonData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow transition"
          >
            <Save size={20} />
            حفظ التعديلات
          </button>

          <button className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-black px-6 py-3 rounded-xl transition">
            <XCircle size={20} />
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
}
