import React from "react";
import { Link } from "react-router-dom";

export default function StagesPage() {
  const stages = [
    {
      id: "primary",
      title: "المرحلة الابتدائية",
      description: "الصفوف من الأول إلى السادس الابتدائي",
    },
    {
      id: "preparatory",
      title: "المرحلة الإعدادية",
      description: "الصفوف من الأول إلى الثالث الإعدادي",
    },
    {
      id: "secondary-general",
      title: "الثانوية العامة",
      description: "نظام الثانوية العامة",
    },
    {
      id: "secondary-baccalaureate",
      title: "البكالوريا المصرية",
      description: "نظام البكالوريا المصرية الجديد",
    },
    {
      id: "special-courses",
      title: "كورسات خاصة",
      description: "تأسيس – تحسين خط – دورات غير مرتبطة بمرحلة",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-center text-yellow-400 mb-10">
        🎓 اختر المرحلة التعليمية
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="border border-yellow-500 rounded-xl p-6
                       transition-all duration-300
                       hover:bg-yellow-500 hover:text-black
                       hover:scale-105 cursor-pointer"
          >
            <h2 className="text-xl font-bold mb-2">{stage.title}</h2>
            <p className="text-sm opacity-80">{stage.description}</p>
          </div>
        ))}
      </div>

      {/* 🔘 زر صغير لعرض الكورسات القديمة */}
      <div className="mt-12 text-center">
        <Link
          to="/courses/list"
          className="inline-block text-sm text-yellow-400
                     border border-yellow-500 px-4 py-2 rounded
                     hover:bg-yellow-500 hover:text-black transition"
        >
          عرض جميع الكورسات
        </Link>
      </div>
    </div>
  );
}
