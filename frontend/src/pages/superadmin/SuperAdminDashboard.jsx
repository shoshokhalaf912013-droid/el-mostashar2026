import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/superadmin/Sidebar";
import Topbar from "../../components/superadmin/Topbar";
import Navbar from "../../components/Navbar";

/* ✅ إدارة المعلمين */
import CreateTeacherModal from "../../components/superadmin/CreateTeacherModal";
import TeachersTable from "../../components/superadmin/TeachersTable";

export default function SuperAdminDashboard() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-x-hidden">

      {/* ✅ Navbar */}
      <Navbar role="super-admin" isSuperAdmin={true} />

      <div className="flex w-full">

        {/* ✅ Sidebar */}
        <div className="w-72 flex-shrink-0">
          <Sidebar />
        </div>

        {/* ✅ المحتوى */}
        <div className="flex-1 min-w-0">
          <Topbar />

          <div className="p-8 space-y-10">

            {/* 👨‍🏫 إدارة المعلمين */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition"></div>

              <div className="relative bg-gray-900 border border-yellow-500/40 rounded-xl p-6 space-y-6">
                <h2 className="text-2xl font-extrabold text-yellow-400 tracking-wide">
                  👨‍🏫 إدارة المعلمين
                </h2>

                <CreateTeacherModal />

                <TeachersTable />
              </div>
            </div>

            {/* ⬇️ الصفحات الفرعية */}
            <Outlet />

          </div>
        </div>

      </div>
    </div>
  );
}