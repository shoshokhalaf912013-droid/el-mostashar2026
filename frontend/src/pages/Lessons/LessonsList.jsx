import React from "react";

export default function LessonsList() {
  const lessons = [
    {
      id: 1,
      title: "الدرس الأول: الدولة الإسلامية",
      image: "/assets/lessons/lesson1.jpg",
    },
    {
      id: 2,
      title: "الفتح الإسلامي",
      image: "/assets/lessons/lesson2.jpg",
    },
    {
      id: 3,
      title: "العصر الذهبي",
      image: "/assets/lessons/lesson3.jpg",
    },
  ];

  return (
    <div className="page-container">
      <h1 className="text-center text-3xl font-bold text-[var(--gold)] mb-8">
        قائمة الدروس
      </h1>

      <div className="items-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="super-card">
            <img src={lesson.image} alt={lesson.title} />
            <h2 className="text-xl text-center mt-3">{lesson.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
