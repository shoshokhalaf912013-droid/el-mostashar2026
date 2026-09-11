import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ControlCard({ title, description, icon, to }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{
        scale: 1.04,
        boxShadow: "0 0 25px rgba(234,179,8,0.6)",
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(to)}
      className="
        cursor-pointer
        bg-gradient-to-br from-black via-gray-900 to-black
        border border-yellow-400/50
        rounded-2xl
        p-6
        transition
        hover:border-yellow-400
      "
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl">{icon}</div>
        <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default function SuperAdminControlCenter() {
  return (
    <div className="space-y-10">

      {/* 🧠 العنوان */}
      <div>
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">
          👑 Control Center
        </h1>
        <p className="text-gray-400">
          مركز التحكم الكامل في المنصة — صلاحيات سيادية بدون قيود
        </p>
      </div>

      {/* 🧱 الشبكة الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* الرئيسية */}
        <ControlCard
          title="الرئيسية"
          icon="🏠"
          description="نظرة عامة على حالة المنصة، النشاط، وأهم المؤشرات"
          to="/super-admin/dashboard"
        />

        {/* إدارة المستخدمين */}
        <ControlCard
          title="إدارة المستخدمين"
          icon="👥"
          description="التحكم الكامل في المستخدمين، الأدوار، والحسابات"
          to="/super-admin/users"
        />

        {/* إدارة المدرسين */}
        <ControlCard
          title="إدارة المدرسين"
          icon="🧑‍🏫"
          description="إضافة، تعديل، وتخصيص المدرسين حسب المواد والمراحل"
          to="/super-admin/manage-teachers"
        />

        {/* الامتحانات */}
        <ControlCard
          title="الامتحانات"
          icon="📝"
          description="إدارة الامتحانات، النتائج، والتقييمات"
          to="/super-admin/manage-exams"
        />

        {/* الإحصائيات */}
        <ControlCard
          title="الإحصائيات"
          icon="📊"
          description="تحليلات شاملة، أرقام، ومؤشرات أداء المنصة"
          to="/super-admin/statistics"
        />

        {/* ☠️ غرفة العمليات */}
        <ControlCard
          title="غرفة العمليات"
          icon="☠️"
          description="صلاحيات خطِرة — تعطيل، تدخل سيادي، وتحكم كامل"
          to="/super-admin/__critical"
        />

      </div>
    </div>
  );
}
