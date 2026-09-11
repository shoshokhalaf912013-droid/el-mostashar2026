// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ user, role }) {
  // ✅ إضافة بسيطة
  const isSuperAdmin = role === "super-admin";

  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-white">
      {/* ✅ نمرر isSuperAdmin للـ Navbar */}
      <Navbar user={user} role={role} isSuperAdmin={isSuperAdmin} />

      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
