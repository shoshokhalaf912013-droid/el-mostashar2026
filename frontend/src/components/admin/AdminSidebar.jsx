import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const links = [
    { label: "الرئيسية", path: "/admin" },
    { label: "مراجعة الدروس", path: "/lessons/manage" },
    { label: "اعتماد الكويزات", path: "/lessons/manage" },
    { label: "تقارير عامة", path: "/admin/reports" },
  ];

  return (
    <div className="w-64 bg-[#111] border-r border-yellow-700 min-h-screen p-5">
      <ul className="space-y-4">
        {links.map((item, i) => (
          <li
            key={i}
            onClick={() => navigate(item.path)}
            className="cursor-pointer text-yellow-300 hover:text-yellow-400"
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
