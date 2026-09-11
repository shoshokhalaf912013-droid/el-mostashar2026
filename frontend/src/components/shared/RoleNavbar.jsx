import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleNavbar({ role }) {
  const navigate = useNavigate();

  const title =
    role === "admin"
      ? "لوحة تحكم الأدمن"
      : role === "teacher"
      ? "لوحة تحكم المعلم"
      : "لوحة التحكم";

  const color =
    role === "admin" ? "text-yellow-400 border-yellow-700" : "text-blue-400 border-blue-700";

  return (
    <div className={`w-full bg-[#0b0b0b] border-b ${color} px-6 py-4 flex justify-between items-center`}>
      <h1
        className={`font-bold text-xl cursor-pointer ${color}`}
        onClick={() => navigate(`/${role}`)}
      >
        {title}
      </h1>

      <button
        onClick={() => navigate("/login")}
        className="text-sm text-red-400 hover:underline"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
