// src/pages/superadmin/UsersManagement.jsx

import React, { useEffect, useState } from "react";
import { PLATFORM_OWNER_EMAIL } from "../../config/owner";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { role } = useAuth();

  const canManageSubscriptions =
    role === "admin" || role === "super-admin";

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const q = query(
        collection(db, "users"),
        where("role", "in", [
          "student",
          "teacher",
          "admin",
          "super-admin",
        ])
      );

      const snap = await getDocs(q);

      const usersData = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        // 🔥 إخفاء السوبر أدمن نهائيًا
        .filter(
          (u) =>
            u.email?.toLowerCase().trim() !==
            PLATFORM_OWNER_EMAIL.toLowerCase().trim()
        );

      setUsers(usersData);
    } catch (e) {
      console.error("Users fetch error:", e);
      toast.error("❌ خطأ أثناء تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(userId, newRole) {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
      });

      toast.success("✔ تم تحديث الصلاحية");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole }
            : u
        )
      );
    } catch (e) {
      console.error("Change role error:", e);
      toast.error("❌ خطأ أثناء التحديث");
    }
  }

  /* =====================================================
     SUBSCRIPTION
     ===================================================== */

  async function activateSubscription(user) {
    if (!canManageSubscriptions) {
      toast.error("❌ ليس لديك صلاحية لتفعيل الاشتراكات");
      return;
    }

    if (user.role !== "student") {
      toast.error("❌ الاشتراك مخصص للطلاب فقط");
      return;
    }

    try {
      const subscriptionEnd = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );

      await updateDoc(doc(db, "users", user.id), {
        // Synchronize the status fields used across the platform.
        status: "active",
        subscriptionStatus: "active",
        subscriptionEnds: subscriptionEnd,
        subscriptionEnd: subscriptionEnd,
        subscriptionActivatedManually: true,
        subscriptionActivatedBy: role,
      });

      toast.success(
        `✅ تم تفعيل اشتراك ${user.email || "الطالب"} لمدة 30 يومًا`
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                subscriptionStatus: "active",
                subscriptionEnd: subscriptionEnd,
                subscriptionActivatedManually: true,
                subscriptionActivatedBy: role,
              }
            : u
        )
      );
    } catch (e) {
      console.error("Activate subscription error:", e);
      toast.error("❌ حدث خطأ أثناء تفعيل الاشتراك");
    }
  }

  async function cancelSubscription(user) {
    if (!canManageSubscriptions) {
      toast.error("❌ ليس لديك صلاحية لإلغاء الاشتراكات");
      return;
    }

    if (user.role !== "student") {
      toast.error("❌ الاشتراك مخصص للطلاب فقط");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.id), {
        status: "waiting_payment",
        subscriptionStatus: "pending",
        subscriptionEnds: null,
        subscriptionEnd: null,
        subscriptionActivatedManually: false,
        subscriptionActivatedBy: null,
      });

      toast.success("🔴 تم إلغاء الاشتراك");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                subscriptionStatus: "pending",
                subscriptionEnd: null,
                subscriptionActivatedManually: false,
                subscriptionActivatedBy: null,
              }
            : u
        )
      );
    } catch (e) {
      console.error("Cancel subscription error:", e);
      toast.error("❌ حدث خطأ أثناء إلغاء الاشتراك");
    }
  }

  /* =====================================================
     SUBSCRIPTION HELPERS
     ===================================================== */

  function getSubscriptionDate(value) {
    if (!value) return null;

    try {
      if (typeof value.toDate === "function") {
        return value.toDate();
      }

      if (value instanceof Date) {
        return value;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  }

  function isSubscriptionActive(user) {
    if (user.subscriptionStatus !== "active") {
      return false;
    }

    const endDate = getSubscriptionDate(
      user.subscriptionEnd
    );

    if (!endDate) {
      return false;
    }

    return endDate.getTime() > Date.now();
  }

  function formatSubscriptionDate(value) {
    const date = getSubscriptionDate(value);

    if (!date) {
      return "غير محدد";
    }

    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function getSubscriptionLabel(user) {
    if (isSubscriptionActive(user)) {
      return "نشط";
    }

    if (user.subscriptionStatus === "verification") {
      return "قيد المراجعة";
    }

    if (user.subscriptionStatus === "pending") {
      return "غير نشط";
    }

    if (user.subscriptionStatus === "active") {
      return "منتهي";
    }

    return "غير مشترك";
  }

  function getSubscriptionClass(user) {
    if (isSubscriptionActive(user)) {
      return "text-green-400";
    }

    if (user.subscriptionStatus === "verification") {
      return "text-yellow-400";
    }

    return "text-red-400";
  }

  return (
    <div className="p-6 text-white bg-gray-900 min-h-[70vh] rounded-lg border border-yellow-600">
      <Toaster />

      <div className="mb-6 p-4 rounded bg-green-600 text-black font-bold text-center">
        ✅ إدارة المستخدمين تعمل بنجاح
      </div>

      <h1 className="text-2xl font-bold text-yellow-400 mb-5">
        👥 إدارة المستخدمين
      </h1>

      {loading ? (
        <p className="text-gray-400 text-center">
          جاري تحميل المستخدمين...
        </p>
      ) : users.length === 0 ? (
        <p className="text-red-400 text-center">
          لا يوجد مستخدمون
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="border border-yellow-600 p-4 rounded-lg bg-black"
            >
              {/* =================================================
                  USER INFORMATION
              ================================================= */}

              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold">
                    {u.email || "بدون إيميل"}
                  </p>

                  <p className="text-sm text-gray-400">
                    الدور:{" "}
                    <span className="text-yellow-300">
                      {u.role}
                    </span>
                  </p>

                  {/* =================================================
                      SUBSCRIPTION INFORMATION
                  ================================================= */}

                  {u.role === "student" && (
                    <div className="mt-3 p-3 rounded-lg border border-gray-700 bg-gray-900">
                      <div className="flex flex-wrap items-center gap-4 text-sm">

                        <div>
                          <span className="text-gray-400">
                            الاشتراك:
                          </span>{" "}
                          <span
                            className={`font-bold ${getSubscriptionClass(
                              u
                            )}`}
                          >
                            {getSubscriptionLabel(u)}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400">
                            ينتهي:
                          </span>{" "}
                          <span className="text-white">
                            {formatSubscriptionDate(
                              u.subscriptionEnd
                            )}
                          </span>
                        </div>

                        {u.subscriptionActivatedManually && (
                          <div className="text-blue-400">
                            ⚡ تفعيل يدوي
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* =================================================
                    ROLE CONTROL
                ================================================= */}

                <select
                  value={u.role}
                  className="bg-black border border-yellow-500 p-2 rounded-lg"
                  onChange={(e) =>
                    changeRole(
                      u.id,
                      e.target.value
                    )
                  }
                >
                  <option value="student">
                    🎓 طالب
                  </option>

                  <option value="teacher">
                    📘 مدرس
                  </option>

                  <option value="admin">
                    🛡 أدمن
                  </option>
                </select>
              </div>

              {/* =================================================
                  SUBSCRIPTION CONTROLS
              ================================================= */}

              {u.role === "student" &&
                canManageSubscriptions && (
                  <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-3">

                    {/* =========================
                        ACTIVE SUBSCRIPTION
                    ========================= */}

                    {isSubscriptionActive(u) ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            activateSubscription(u)
                          }
                          className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white font-bold transition"
                        >
                          🔄 تجديد 30 يوم
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cancelSubscription(u)
                          }
                          className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold transition"
                        >
                          🔴 إلغاء الاشتراك
                        </button>
                      </>
                    ) : (
                      /* =========================
                         INACTIVE SUBSCRIPTION
                      ========================= */

                      <button
                        type="button"
                        onClick={() =>
                          activateSubscription(u)
                        }
                        className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-black font-bold transition"
                      >
                        ⚡ تفعيل الاشتراك لمدة 30 يوم
                      </button>
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}