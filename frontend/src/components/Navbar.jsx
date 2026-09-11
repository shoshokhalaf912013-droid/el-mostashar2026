// src/components/Navbar.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";

export default function Navbar({ user, role, isSuperAdmin }) {
  const navigate = useNavigate();

  /* =========================
     AUTH USER
  ========================= */

  const currentUser = user || null;

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  /* =========================
     ROLE
  ========================= */

  const normalizedRole = (
    role ||
    currentUser?.role ||
    ""
  ).toLowerCase();

  const isSuper =
    isSuperAdmin ||
    normalizedRole === "super-admin" ||
    normalizedRole === "superadmin";

  const isAdmin =
    normalizedRole === "admin";

  const isTeacher =
    normalizedRole === "teacher";

  const isStudent =
    normalizedRole === "student";

  /* =========================
     DASHBOARD ACCESS
  ========================= */

  const canAccessTeacherPanel =
    isTeacher ||
    isAdmin ||
    isSuper;

  /* =========================
     UI
  ========================= */

  return (
    <nav
      className="navbar"
      dir="rtl"
    >

      {/* =========================
          LOGO
      ========================= */}

      <div className="text-gold font-bold text-xl">
        المستشار 2026
      </div>

      {/* =========================
          MAIN LINKS
      ========================= */}

      <ul className="nav-links">

        <li>
          <Link to="/">
            الرئيسية
          </Link>
        </li>

        <li>
          <Link to="/about">
            عن الموقع
          </Link>
        </li>

        <li>
          <Link to="/policy">
            سياسة الخصوصية
          </Link>
        </li>

        <li>
          <Link to="/contact">
            اتصل بنا
          </Link>
        </li>

        {/* =========================
            STUDENT SUBJECTS
        ========================= */}

        {currentUser && isStudent && (
          <li>
            <Link
              to="/student/select-stage"
              className="student-subjects-link"
            >
              المواد التعليمية
            </Link>
          </li>
        )}

      </ul>

      {/* =========================
          USER ACTIONS
      ========================= */}

      <div className="flex items-center gap-3">

        {/* ==================================================
            Zائر غير مسجل
        ================================================== */}

        {!currentUser && (
          <>
            <Link
              to="/register"
              className="
                btn-gold
                text-black
                px-4
                py-2
                rounded-xl
                font-bold
              "
            >
              إنشاء حساب
            </Link>

            <Link
              to="/login"
              className="
                btn-gold
                text-black
                px-4
                py-2
                rounded-xl
                font-bold
              "
            >
              تسجيل الدخول
            </Link>
          </>
        )}

        {/* ==================================================
            TEACHER / ADMIN
        ================================================== */}

        {currentUser &&
          canAccessTeacherPanel && (
            <Link
              to="/teacher"
              className="
                btn-gold
                text-black
                px-4
                py-2
              "
            >
              🎓 لوحة التحكم
            </Link>
          )}

        {/* ==================================================
            SUPER ADMIN
        ================================================== */}

        {currentUser && isSuper && (
          <Link
            to="/super-admin"
            className="
              superadmin-btn
              flex
              items-center
              gap-1
            "
          >
            🛡️ لوحة تحكم السوبر أدمن
          </Link>
        )}

        {/* ==================================================
            PROFILE
        ================================================== */}

        {currentUser && (
          <Link
            to="/profile"
            className="
              btn-gold
              text-black
              px-4
              py-2
            "
          >
            الملف الشخصي
          </Link>
        )}

        {/* ==================================================
            LOGOUT
        ================================================== */}

        {currentUser && (
          <button
            type="button"
            onClick={handleLogout}
            className="
              border
              border-gold
              text-gold
              px-4
              py-2
              rounded-xl
              hover:bg-gold
              hover:text-black
              duration-200
            "
          >
            تسجيل خروج
          </button>
        )}

      </div>

    </nav>
  );
}