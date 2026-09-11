import React, { useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

export default function ManageExams() {
  const [exams, setExams] = useState([
    {
      id: "ex1",
      title: "امتحان الرياضيات - الوحدة الأولى",
      grade: "الصف الأول الثانوي",
      questions: 20,
      date: "2025-01-15",
    },
    {
      id: "ex2",
      title: "امتحان الفيزياء - الحركة",
      grade: "الصف الثاني الثانوي",
      questions: 25,
      date: "2025-01-10",
    },
  ]);

  return (
    <div className="p-6">
      {/* العنوان + زر إضافة امتحان */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">إدارة الامتحانات</h1>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl shadow">
          <Plus size={18} />
          إضافة امتحان
        </button>
      </div>

      {/* جدول الامتحانات */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b">
              <th className="py-3">العنوان</th>
              <th className="py-3">الصف</th>
              <th className="py-3">عدد الأسئلة</th>
              <th className="py-3">تاريخ النشر</th>
              <th className="py-3">التحكم</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => (
              <tr
                key={exam.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3">{exam.title}</td>
                <td className="py-3">{exam.grade}</td>
                <td className="py-3">{exam.questions}</td>
                <td className="py-3">{exam.date}</td>

                <td className="py-3 flex gap-3 justify-end">
                  {/* عرض */}
                  <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition">
                    <Eye size={18} />
                  </button>

                  {/* تعديل */}
                  <button className="p-2 bg-yellow-300 hover:bg-yellow-400 rounded-xl transition">
                    <Pencil size={18} />
                  </button>

                  {/* حذف */}
                  <button className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
