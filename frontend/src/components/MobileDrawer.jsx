// src/components/MobileDrawer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function MobileDrawer({ open, onClose, user, role }) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div onClick={onClose} className="absolute inset-0 bg-black/60" />

      <aside
        className={`absolute top-0 right-0 h-full w-64 bg-[#0b0b0b] shadow-xl p-4 transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-yellow-400 font-bold text-lg">القائمة</div>
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-700">
            إغلاق
          </button>
        </div>

        <nav className="space-y-3 text-white text-lg">

          <Link to="/" onClick={onClose} className="block">🏠 الرئيسية</Link>
          <Link to="/lessons-list" onClick={onClose} className="block">📘 الدروس</Link>
          <Link to="/exams" onClick={onClose} className="block">📝 الاختبارات</Link>
          <Link to="/gallery" onClick={onClose} className="block">🎥 الفيديوهات</Link>
          <Link to="/subscription-plans" onClick={onClose} className="block">💳 الاشتراك</Link>

          {user && (
            <Link to="/student" onClick={onClose} className="block">
              📖 دروسي
            </Link>
          )}

          {/* teacher/admin/super-admin */}
          {["teacher", "admin", "super-admin"].includes(role) && (
            <>
              <Link to="/instructor/studio" onClick={onClose} className="block">🎓 لوحة المعلم</Link>
              <Link to="/exams/create" onClick={onClose} className="block">✍️ إنشاء امتحان</Link>
            </>
          )}

          {/* admin/super-admin */}
          {["admin", "super-admin"].includes(role) && (
            <Link to="/admin" onClick={onClose} className="block">⚙️ لوحة الإدارة</Link>
          )}

          <div className="mt-4 border-t border-gray-700 pt-3 text-sm text-gray-300">
            {user ? (
              <div>مسجل باسم: {user.email}</div>
            ) : (
              <Link to="/login" onClick={onClose}>
                تسجيل الدخول
              </Link>
            )}
          </div>
        </nav>
      </aside>
    </div>
  );
}
