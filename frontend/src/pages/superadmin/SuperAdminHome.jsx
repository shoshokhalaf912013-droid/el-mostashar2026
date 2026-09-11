// src/pages/superadmin/SuperAdminHome.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function SuperAdminHome() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gold">
        لوحة تحكم السوبر أدمن
      </h2>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 border border-gold/40 p-5 rounded-2xl shadow-lg hover:bg-gold hover:text-black transition">
          <p className="opacity-80">عدد المستخدمين</p>
          <p className="text-4xl font-bold mt-2">1200</p>
        </div>

        <div className="bg-gray-900 border border-gold/40 p-5 rounded-2xl shadow-lg hover:bg-gold hover:text-black transition">
          <p className="opacity-80">عدد الدروس</p>
          <p className="text-4xl font-bold mt-2">45</p>
        </div>

        <div className="bg-gray-900 border border-gold/40 p-5 rounded-2xl shadow-lg hover:bg-gold hover:text-black transition">
          <p className="opacity-80">عدد الامتحانات</p>
          <p className="text-4xl font-bold mt-2">22</p>
        </div>
      </div>

      {/* مربعات الصلاحيات */}
      <h3 className="text-2xl font-semibold mb-4">الصلاحيات</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to="/users"
          className="bg-black border border-gold rounded-2xl p-6 text-center shadow-xl
          hover:bg-gold hover:text-black transition"
        >
          👥
          <p className="mt-2 font-bold">إدارة المستخدمين</p>
        </Link>

        <Link
          to="/courses"
          className="bg-black border border-gold rounded-2xl p-6 text-center shadow-xl
          hover:bg-gold hover:text-black transition"
        >
          📘
          <p className="mt-2 font-bold">إدارة الدروس</p>
        </Link>

        <Link
          to="/exams"
          className="bg-black border border-gold rounded-2xl p-6 text-center shadow-xl
          hover:bg-gold hover:text-black transition"
        >
          📝
          <p className="mt-2 font-bold">الامتحانات</p>
        </Link>

        <Link
          to="/payments"
          className="bg-black border border-gold rounded-2xl p-6 text-center shadow-xl
          hover:bg-gold hover:text-black transition"
        >
          💳
          <p className="mt-2 font-bold">المدفوعات</p>
        </Link>
      </div>
    </div>
  );
}
