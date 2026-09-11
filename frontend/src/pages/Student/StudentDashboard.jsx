import WelcomeWatermark from "@/components/WelcomeWatermark";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentDashboard() {

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  /* ===============================
     انتظار تحميل Auth من Provider
  =============================== */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-400 text-xl">
        ⏳ جاري التحميل...
      </div>
    );
  }

  /* ===============================
     غير مسجل دخول
  =============================== */
  if (!user) {
    navigate("/login");
    return null;
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* العلامة المائية */}
      <WelcomeWatermark
        name={user.displayName || "عزيزي الطالب"}
      />

      <main className="flex-1 text-center mt-20 space-y-6">

        <h1 className="text-3xl font-bold text-yellow-400">
          مرحبًا بك 👋
        </h1>

        <p className="text-gray-400">
          اختر المرحلة أولاً لعرض المواد والمعلمين
        </p>

        <button
          onClick={() => navigate("/student/select-stage")}
          className="
            px-8 py-3
            bg-yellow-500
            hover:bg-yellow-400
            transition
            text-black
            rounded-xl
            font-bold
            shadow-lg
          "
        >
          🚀 استكمل مسارك التعليمي
        </button>

      </main>
    </div>
  );
}