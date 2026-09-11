import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import RoleSidebar from "../../components/shared/RoleSidebar";
import RoleNavbar from "../../components/shared/RoleNavbar";

import "../../styles/teacherdashboard.css";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [isLiveActive, setIsLiveActive] = useState(false);

  const classId = "demo-class";

  useEffect(() => {
    const ref = collection(db, "liveClasses", classId, "pulse");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setIsLiveActive(!snapshot.empty);
    });

    return () => unsubscribe();
  }, []);

  const cards = [
    {
      title: "إدارة الدروس",
      desc: "إضافة وتعديل المحتوى التعليمي",
      path: "/lessons/manage",
    },
    {
      title: "فيديوهاتي",
      desc: "رفع ومراجعة الفيديوهات",
      path: "/lessons/video",
    },
    {
      title: "الكويزات",
      desc: "إدارة الأسئلة والاختبارات",
      path: "/lessons/manage",
    },
    {
      title: "تقارير الامتحانات",
      desc: "تحليل أداء الطلاب",
      path: "/teacher/exam-analytics",
    },
    {
      title: "إدارة اللايف",
      desc: "متابعة الحصة المباشرة",
      path: "/teacher/live",
      live: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white" dir="rtl">
      <RoleSidebar role="teacher" />

      <div className="flex-1">
        <RoleNavbar role="teacher" />

        <div className="p-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-10 text-center">
            لوحة تحكم المعلم
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {cards.map((card, i) => (
              <div
                key={i}
                onClick={() => navigate(card.path)}
                className={`goldcard ${
                  card.live && isLiveActive ? "liveactive" : ""
                }`}
              >
                {card.live && isLiveActive && (
                  <div className="livebadge">LIVE NOW</div>
                )}

                <h2 className="goldtitle">{card.title}</h2>
                <p className="golddesc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}