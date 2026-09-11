import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ================= LOAD LESSONS ================= */
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) return;

        const res = await axios.get(
          `http://localhost:5000/api/lessons?teacherId=${user.uid}`
        );

        setLessons(res.data || []);
      } catch (err) {
        console.error("خطأ في جلب الدروس", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  /* ================= UI ================= */

  return (
    <div style={{ padding: "30px", color: "#fff" }}>
      <h2 style={{ marginBottom: "20px" }}>دروسي</h2>

      {/* زر إضافة درس */}
      <Link to="/teacher/lessons/add">
        <button
          style={{
            marginBottom: "20px",
            padding: "12px 18px",
            background: "#FFD700",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          ➕ إضافة درس جديد
        </button>
      </Link>

      {loading ? (
        <p>⏳ جاري تحميل الدروس...</p>
      ) : lessons.length === 0 ? (
        <p>لا يوجد دروس مضافة حتى الآن</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              style={{
                background: "#0b0b0b",
                border: "1px solid rgba(255,215,0,0.3)",
                borderRadius: "14px",
                padding: "18px",
              }}
            >
              <strong style={{ fontSize: "18px", color: "gold" }}>
                {lesson.title}
              </strong>

              <p style={{ opacity: 0.8 }}>
                {lesson.description}
              </p>

              {/* ===== ACTION BUTTONS ===== */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                  flexWrap: "wrap",
                }}
              >
                {/* مشاهدة */}
                <button
                  onClick={() =>
                    window.open(lesson.videoUrl, "_blank")
                  }
                  style={btnBlue}
                >
                  ▶ مشاهدة
                </button>

                {/* ⭐ بدء اللايف */}
                <button
                  onClick={() =>
                    navigate(`/teacher/live/${lesson.id}`)
                  }
                  style={btnGold}
                >
                  🎥 بدء اللايف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= BUTTON STYLES ================= */

const btnGold = {
  background: "linear-gradient(135deg, #FFD700, #b89600)",
  color: "#000",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnBlue = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};