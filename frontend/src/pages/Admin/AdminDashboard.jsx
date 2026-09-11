import React from "react";
import { useNavigate } from "react-router-dom";

/* ✅ مكونات الادمن */
import PromoteButton from "../../components/admin/PromoteButton";
import UsersRolesViewer from "../../components/admin/UsersRolesViewer";

/* ✅ auth system */
import { useAuth } from "../../contexts/AuthContext";

export default function AdminDashboard() {

  const navigate = useNavigate();

  /* =====================================
     AUTH
  ===================================== */
  const { permissions, loading } = useAuth();

  /* =====================================
     LOADING
  ===================================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        تحميل لوحة التحكم...
      </div>
    );
  }

  /* =====================================
     PROTECTION
     السماح فقط للادمن والسوبر ادمن
  ===================================== */
  if (!permissions?.isAdmin && !permissions?.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
        ❌ غير مصرح بالدخول
      </div>
    );
  }

  /* =====================================
     UI
  ===================================== */
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">

      {/* ================= HEADER ================= */}
      <h1 className="text-2xl font-bold text-yellow-400">
        لوحة تحكم الأدمن
      </h1>

      {/* ================= LESSON MANAGEMENT ================= */}
      <div className="space-y-3">
        <h2 className="text-lg text-yellow-300 font-semibold">
          إدارة المحتوى التعليمى
        </h2>

        <button
          onClick={() => navigate("/lessons/manage")}
          className="
            bg-yellow-400
            hover:bg-yellow-300
            text-black
            px-5
            py-2
            rounded-lg
            font-bold
            transition
          "
        >
          إدارة الدروس
        </button>
      </div>

      {/* ================= USERS ROLES ================= */}
      <div className="space-y-3">
        <h2 className="text-lg text-yellow-300 font-semibold">
          إدارة المستخدمين والصلاحيات
        </h2>

        <UsersRolesViewer />
        <PromoteButton />
      </div>

    </div>
  );
}