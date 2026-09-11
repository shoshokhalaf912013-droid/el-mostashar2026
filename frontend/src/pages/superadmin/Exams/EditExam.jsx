import React, { useState } from "react";
import { Save, XCircle } from "lucide-react";

export default function EditExam() {
  const [examData, setExamData] = useState({
    title: "امتحان الرياضيات - الوحدة الأولى",
    grade: "الصف الأول الثانوي",
    questions: 20,
    date: "2025-01-15",
  });

  const handleChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">تعديل الامتحان</h1>

      <div className="bg-white rounded-2xl shadow p-6">

        {/* عنوان الامتحان */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">عنوان الامتحان</label>
          <input
            type="text"
            name="title"
            value={examData.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* الصف الدراسي */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">الصف الدراسي</label>
          <select
            name="grade"
            value={examData.grade}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>الصف الأول الثانوي</option>
            <option>الصف الثاني الثانوي</option>
            <option>الصف الثالث الثانوي</option>
          </select>
        </div>

        {/* عدد الأسئلة */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">عدد الأسئلة</label>
          <input
            type="number"
            name="questions"
            value={examData.questions}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* تاريخ الامتحان */}
        <div className="mb-5">
          <label className="block mb-2 font-semibold">تاريخ الامتحان</label>
          <input
            type="date"
            name="date"
            value={examData.date}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-4 mt-6">
          {/* حفظ */}
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition shadow"
          >
            <Save size={20} />
            حفظ التعديلات
          </button>

          {/* إلغاء */}
          <button
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-black px-5 py-3 rounded-xl transition"
          >
            <XCircle size={20} />
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
}
