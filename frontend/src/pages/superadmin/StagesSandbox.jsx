import React from "react";

export default function StagesSandbox() {
  const stages = [
    { id: 1, title: "المرحلة الابتدائية", desc: "إدارة الصفوف والمواد" },
    { id: 2, title: "المرحلة الإعدادية", desc: "هيكلة المناهج" },
    { id: 3, title: "المرحلة الثانوية", desc: "عام + بكالوريا" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-yellow-400">
        🧪 Sandbox — مراحل التعليم
      </h2>

      <p className="opacity-70">
        هذه لوحة تجريبية (Read-Only). لا تعديل — لا حفظ — لا تأثير.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((s) => (
          <div
            key={s.id}
            className="bg-[#111] border border-yellow-400/30 rounded-xl p-5
                       hover:border-yellow-400 transition"
          >
            <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
            <p className="text-sm opacity-80">{s.desc}</p>

            <button
              disabled
              className="mt-4 w-full py-2 rounded bg-black border border-gray-700
                         text-gray-500 cursor-not-allowed"
            >
              قريبًا
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
