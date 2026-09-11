import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSidebar({ role }) {
  const navigate = useNavigate();

  const menus = {
    admin: [
      { label: "الرئيسية", path: "/admin" },
      { label: "مراجعة الدروس", path: "/lessons/manage" },
      { label: "اعتماد الكويزات", path: "/lessons/manage" },
      { label: "تقارير عامة", path: "/admin/reports" },
    ],

    teacher: [
      { label: "الرئيسية", path: "/teacher" },
      { label: "إدارة الدروس", path: "/lessons/manage" },
      { label: "فيديوهاتي", path: "/lessons/video" },
      { label: "الكويزات", path: "/lessons/manage" },
    ],
  };

  const links = menus[role] || [];

  return (
    <div
      className={`w-64 min-h-screen p-6 border-r
        ${role === "admin" ? "bg-[#111] border-yellow-700" : "bg-[#0b0b0b] border-blue-700"}
      `}
    >
      <ul className="space-y-4">
        {links.map((item, i) => (
          <li
            key={i}
            onClick={() => navigate(item.path)}
            className={`cursor-pointer transition
              ${role === "admin"
                ? "text-yellow-300 hover:text-yellow-400"
                : "text-blue-300 hover:text-blue-400"}
            `}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
