import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

function NavItem({
  label,
  icon,
  onClick,
  active = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        text-right
        px-4
        py-3
        rounded-xl
        transition-all
        duration-300
        flex
        items-center
        justify-between
        gap-3
        border
        ${
          active
            ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.35)]"
            : "bg-transparent text-white border-transparent hover:bg-gray-800 hover:border-yellow-400/40"
        }
      `}
    >
      <span className="flex items-center gap-3">
        <span className="text-lg">
          {icon}
        </span>

        <span className="font-medium">
          {label}
        </span>
      </span>
    </button>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="flex min-h-screen bg-black text-white"
      dir="rtl"
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className="
          w-72
          shrink-0
          bg-[#0b0b0b]
          border-l
          border-gray-800
          p-4
        "
      >

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6">

          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            🛠️ Admin
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            لوحة تحكم الإدارة
          </p>

        </div>

        <nav className="space-y-3">

          {/* =========================
              HOME
          ========================= */}

          <NavItem
            icon="🏠"
            label="الرئيسية"
            active={
              location.pathname === "/admin" ||
              location.pathname === "/admin/"
            }
            onClick={() =>
              navigate("/admin")
            }
          />

          {/* =========================
              USERS
          ========================= */}

          <NavItem
            icon="👥"
            label="إدارة المستخدمين"
            active={location.pathname.includes("/admin/users")}
            onClick={() =>
              navigate("/admin/users")
            }
          />

          {/* =========================
              EXAMS
          ========================= */}

          <NavItem
            icon="📝"
            label="إضافة امتحان"
            active={location.pathname === "/admin/add-exam"}
            onClick={() =>
              navigate("/admin/add-exam")
            }
          />

          {/* =========================
              QUESTIONS
          ========================= */}

          <NavItem
            icon="❓"
            label="إضافة سؤال"
            active={location.pathname.includes("/admin/add-question")}
            onClick={() =>
              navigate("/admin/add-question")
            }
          />

          {/* =========================
              LESSONS
          ========================= */}

          <NavItem
            icon="📚"
            label="إدارة الوحدات والدروس"
            active={location.pathname.includes("/admin/lessons-manager")}
            onClick={() =>
              navigate("/admin/lessons-manager")
            }
          />

          {/* =========================
              ADD LESSON
          ========================= */}

          <NavItem
            icon="➕"
            label="إضافة درس"
            active={location.pathname === "/admin/add-lesson"}
            onClick={() =>
              navigate("/admin/add-lesson")
            }
          />

          {/* =========================
              SUBJECT BUILDER
          ========================= */}

          <NavItem
            icon="🧩"
            label="بناء المواد والوحدات"
            active={location.pathname.includes("/admin/subjects")}
            onClick={() =>
              navigate("/admin/subjects-builder")
            }
          />

          {/* =========================
              REPORTS
          ========================= */}

          <NavItem
            icon="📊"
            label="التقارير"
            active={location.pathname.includes("/admin/reports")}
            onClick={() =>
              navigate("/admin/reports")
            }
          />

        </nav>

      </aside>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="flex-1 min-w-0 p-6">

        <Outlet />

      </main>

    </div>
  );
}