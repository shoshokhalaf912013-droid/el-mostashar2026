import React from "react";

export default function LessonsSidebar({ units }) {
  // ✅ تأمين البيانات
  const safeUnits = Array.isArray(units) ? units : [];

  return (
    <aside className="w-72 bg-[#111] border-l border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-yellow-400 mb-4">
        محتوى المادة
      </h2>

      {safeUnits.length === 0 && (
        <p className="text-sm text-gray-400">
          لا توجد وحدات بعد
        </p>
      )}

      {safeUnits.map((unit) => {
        const safeLessons = Array.isArray(unit.lessons)
          ? unit.lessons
          : [];

        return (
          <div key={unit.id} className="mb-4">
            <h3 className="text-sm font-bold mb-2">
              {unit.title}
            </h3>

            {safeLessons.length === 0 ? (
              <p className="text-xs text-gray-500 pr-2">
                لا توجد دروس
              </p>
            ) : (
              <ul className="space-y-1 pr-2">
                {safeLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="text-sm text-gray-300 hover:text-yellow-400 cursor-pointer"
                  >
                    {lesson.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}
