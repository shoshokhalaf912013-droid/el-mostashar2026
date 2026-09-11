import React from "react";
import { Link } from "react-router-dom";

export default function Courses() {
  const courses = [
    {
      id: 1,
      title: "أساسيات البرمجة",
      desc: "تعلم أهم مفاهيم البرمجة من الصفر مع أمثلة عملية.",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "تطوير الويب",
      desc: "كورس شامل HTML, CSS, JavaScript لبناء مواقع احترافية.",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "React للمبتدئين",
      desc: "ابدأ رحلتك في تعلم React لبناء تطبيقات ويب تفاعلية.",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">جميع الكورسات</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100"
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-40 object-cover rounded-t-xl"
            />

            <div className="p-4">
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{course.desc}</p>

              <Link
                to={`/course/${course.id}`}
                className="inline-block mt-4 w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                مشاهدة الكورس
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
