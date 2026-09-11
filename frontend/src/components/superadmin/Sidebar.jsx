import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  CreditCard,
  DollarSign,
  BarChart3,
  Settings,
  AlertTriangle,
} from "lucide-react";

export default function Sidebar() {
  const base =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-gray-800";
  const active = "bg-gray-800 text-yellow-400";

  return (
    <aside className="w-64 bg-[#0b0b0b] border-r border-gray-800 min-h-screen p-4">
      <h2 className="text-xl font-bold text-yellow-400 mb-6 text-center">
        👑 Super Admin
      </h2>

      {/* 🟢 الإدارة اليومية */}
      <div className="text-gray-400 text-sm mb-2">الإدارة اليومية</div>

      <NavLink to="/super-admin/dashboard" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <LayoutDashboard size={18} /> لوحة التحكم
      </NavLink>

      <NavLink to="/super-admin/students" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <GraduationCap size={18} /> إدارة الطلاب
      </NavLink>

      <NavLink to="/super-admin/manage-teachers" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <Users size={18} /> إدارة المدرسين
      </NavLink>

      <NavLink to="/super-admin/lessons" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <BookOpen size={18} /> إدارة الدروس
      </NavLink>

      <NavLink to="/super-admin/units" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <Layers size={18} /> الوحدات التعليمية
      </NavLink>

      <NavLink to="/super-admin/payments" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <DollarSign size={18} /> المدفوعات
      </NavLink>

      <NavLink to="/super-admin/subscriptions" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <CreditCard size={18} /> الباقات والاشتراكات
      </NavLink>

      {/* 🟡 إدارة متقدمة */}
      <div className="text-gray-400 text-sm mt-6 mb-2">إدارة متقدمة</div>

      <NavLink to="/super-admin/statistics" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <BarChart3 size={18} /> الإحصائيات
      </NavLink>

      <NavLink to="/super-admin/settings" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
        <Settings size={18} /> الإعدادات
      </NavLink>

      {/* 🔴 غرفة العمليات */}
      <div className="mt-8 border-t border-gray-800 pt-4">
        <NavLink
          to="/super-admin/__critical"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30"
        >
          <AlertTriangle size={18} /> غرفة العمليات
        </NavLink>
      </div>
    </aside>
  );
}
