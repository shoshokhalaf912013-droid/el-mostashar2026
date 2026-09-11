// src/pages/Student/HomeworkPage.jsx

import React, { useState } from "react";
import "./styles/homework.css";

export default function HomeworkPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "واجب 1 — أسئلة على الدرس",
      description: "أجب عن الأسئلة المتعلقة بالدرس الأول.",
      status: "pending",
    },
    {
      id: 2,
      title: "واجب 2 — تطبيق عملي",
      description: "قم بحل التمرين التطبيقي الخاص بالدرس.",
      status: "pending",
    },
  ]);

  const markAsDone = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "done" } : t))
    );
  };

  return (
    <div className="hw-container">
      <h1 className="hw-title">📘 الواجبات المطلوبة</h1>

      {tasks.map((task) => (
        <div key={task.id} className="hw-card">
          <h2 className="hw-card-title">{task.title}</h2>
          <p className="hw-card-desc">{task.description}</p>

          {task.status === "pending" ? (
            <button className="hw-btn" onClick={() => markAsDone(task.id)}>
              تسليم الواجب
            </button>
          ) : (
            <p className="hw-done">✔ تم تسليم الواجب</p>
          )}
        </div>
      ))}
    </div>
  );
}
