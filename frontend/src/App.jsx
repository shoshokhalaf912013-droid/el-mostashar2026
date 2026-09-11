import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// styles
import "./styles/index.css";
import "./styles/theme.css";
import "./styles/admin-dashboard.css";
import "./styles/layout.css";

// auth
import { useAuth } from "./contexts/AuthContext";

// firebase
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// layout
import Layout from "./components/Layout.jsx";

// birthday
import BirthdaySystem from "./components/BirthdaySystem";
import GlobalCelebrationLayer from "./components/GlobalCelebrationLayer";

// pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Policy from "./pages/Policy.jsx";
import SubscriptionPlans from "./pages/SubscriptionPlans.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import SetTeacherRole from "./pages/SetTeacherRole"; // ✅ صفحة الإصلاح

// routes
import CoursesRoutes from "./routes/CoursesRoutes.jsx";
import ExamsRoutes from "./routes/ExamsRoutes.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import StudentRoutes from "./routes/StudentRoutes.jsx";
import SuperAdminRoutes from "./routes/SuperAdminRoutes.jsx";
import TeacherRoutes from "./routes/TeacherRoutes.jsx";

export default function App() {
  const location = useLocation();
  const { user, role, loading } = useAuth();

  const [studentName, setStudentName] = useState("");

  /* ================= LOAD NAME ================= */
  useEffect(() => {
    if (!user?.uid) {
      setStudentName("");
      return;
    }

    const fetchName = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();

          const name =
            data.fullName ||
            data.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "";

          setStudentName(name);
        }
      } catch (err) {
        console.error("Name Load Error:", err);
      }
    };

    fetchName();
  }, [user]);

  /* ================= GLOBAL LOADING ================= */

  if (loading || (user && !role)) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-400 text-xl">
        ⏳ جاري تجهيز المنصة...
      </div>
    );
  }

  /* ================= ROLES ================= */

  const normalizedRole = role?.toLowerCase();

  const isSuperAdmin = normalizedRole === "super-admin";
  const isAdmin = normalizedRole === "admin";
  const isTeacher = normalizedRole === "teacher";
  const isStudent = normalizedRole === "student";

  const canUpload = isAdmin || isSuperAdmin || isTeacher;

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  const isHome = location.pathname === "/";

  /* ================= APP ================= */

  return (
    <>
      {/* ⭐ احتفالات الطالب */}
      {user && isStudent && !isAuthPage && studentName && (
        <>
          <BirthdaySystem user={user} />
          <GlobalCelebrationLayer studentName={studentName} />
        </>
      )}

      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/student" replace />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/student" replace />}
        />

        {/* MAIN LAYOUT */}
        <Route
          path="/"
          element={
            <Layout
              user={user}
              role={role}
              isSuperAdmin={isSuperAdmin}
              isAdmin={isAdmin}
              isTeacher={isTeacher}
              isStudent={isStudent}
              canUpload={canUpload}
              isHome={isHome}
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="subscription-plans" element={<SubscriptionPlans />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policy" element={<Policy />} />

          <Route path="courses/*" element={<CoursesRoutes />} />
          <Route path="exams/*" element={<ExamsRoutes />} />

          <Route
            path="profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
        </Route>

        {/* STUDENT */}
        <Route
          path="/student/*"
          element={user ? <StudentRoutes /> : <Navigate to="/login" replace />}
        />

        {/* SUPER ADMIN */}
        <Route
          path="/super-admin/*"
          element={
            isSuperAdmin ? <SuperAdminRoutes /> : <Navigate to="/" replace />
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            isAdmin || isSuperAdmin ? (
              <AdminRoutes />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* TEACHER */}
        <Route
          path="/teacher/*"
          element={
            isTeacher || isAdmin || isSuperAdmin ? (
              <TeacherRoutes />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ✅ صفحة إصلاح الدور (مؤقتة) */}
        <Route
          path="/fix-role"
          element={user ? <SetTeacherRole /> : <Navigate to="/login" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}