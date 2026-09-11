import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAuth, signOut } from "firebase/auth";

export default function Profile() {

  const { user, userData, role, loading } = useAuth();

  if (loading)
    return <div className="text-center mt-10">جاري التحميل...</div>;

  if (!user) return null;

  const logoutNow = async () => {
    await signOut(getAuth());
    window.location.reload();
  };

  const roleNameMap = {
    superadmin: "مدير النظام (سوبر أدمن)",
    admin: "مشرف",
    teacher: "معلم",
    student: "طالب",
  };

  const roleName = roleNameMap[role] || "مستخدم";

  return (
    <div className="max-w-2xl mx-auto">

      {/* ===== PROFILE CARD ===== */}
      <div className="card mb-4 flex items-center gap-6">

        <img
          src={user.photoURL || "/teacher.png"}
          alt="profile"
          className="w-24 h-24 rounded-lg object-cover"
        />

        <div>
          <h3 className="text-xl font-bold">
            {userData?.name || user.displayName || "المستخدم"}
          </h3>

          <p className="text-sm text-[rgba(255,255,255,0.7)]">
            {roleName}
          </p>

          <div className="mt-2 text-sm">
            البريد: {user.email}
          </div>
        </div>
      </div>

      {/* ===== STUDENT SECTION ===== */}
      {role === "student" && (
        <div className="card">
          <h4 className="font-semibold mb-2">تقدم الطالب</h4>
          <ul>
            <li>دروس مكتملة: 12</li>
            <li>اختبارات: 4</li>
            <li>متوسط الدرجات: 82%</li>
          </ul>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={logoutNow}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
        >
          تسجيل خروج حقيقى
        </button>
      </div>

    </div>
  );
}