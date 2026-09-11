// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import MobileDrawer from "../components/MobileDrawer.jsx";
import "../styles/layout.css";

export default function MainLayout({ user, role, canUpload }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" dir="rtl">
      {/* Navbar */}
      <Navbar
        user={user}
        role={role}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        role={role}
      />

      {/* Page Content */}
      <main className="flex-grow p-4 md:p-6 page-container">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-yellow-600 text-gray-400">
        © 2026 جميع الحقوق محفوظة | تصميم: م. خلف محروس
      </footer>
    </div>
  );
}
