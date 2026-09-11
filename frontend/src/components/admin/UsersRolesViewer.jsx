import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function UsersRolesViewer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ===============================
  // جلب المستخدمين من Firestore فقط
  // ===============================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    } catch (err) {
      console.error("❌ Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ترقية الدور (Super Admin فقط)
  // ===============================
  const promoteUser = async (uid, currentRole) => {
    let nextRole = null;

    if (currentRole === "student") nextRole = "teacher";
    else if (currentRole === "teacher") nextRole = "admin";
    else if (currentRole === "admin") nextRole = "super-admin";

    if (!nextRole) return;

    const confirm = window.confirm(
      `هل أنت متأكد من ترقية المستخدم إلى ${nextRole} ؟`
    );
    if (!confirm) return;

    try {
      setUpdatingId(uid);

      await updateDoc(doc(db, "users", uid), {
        role: nextRole,
      });

      await fetchUsers();
    } catch (err) {
      console.error("❌ Promote error:", err);
      alert("فشل تغيير الدور");
    } finally {
      setUpdatingId(null);
    }
  };

  // ===============================
  // ➕ تصدير CSV (إضافة آمنة)
  // ===============================
  const exportCSV = () => {
    if (users.length === 0) return;

    const header = ["uid", "email", "role"];
    const rows = users.map((u) => [
      u.uid,
      u.email || "",
      u.role || "",
    ]);

    let csvContent =
      header.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      "users_roles_backup.csv"
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===============================
  // UI
  // ===============================
  if (loading) {
    return (
      <div className="text-yellow-400 text-lg">
        ⏳ جاري تحميل المستخدمين...
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-yellow-400">
          👥 المستخدمون و الأدوار
        </h2>

        {/* زر التصدير – إضافة فقط */}
        <button
          onClick={exportCSV}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
        >
          ⬇ تصدير CSV
        </button>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-400">لا يوجد مستخدمون</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-left">
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.uid}
                className="border-b border-gray-800 hover:bg-[#1a1a1a]"
              >
                <td className="py-2 px-3">
                  {user.email || "—"}
                </td>

                <td className="py-2 px-3 font-bold text-green-400">
                  {user.role}
                </td>

                <td className="py-2 px-3">
                  {user.role !== "super-admin" ? (
                    <button
                      onClick={() =>
                        promoteUser(user.uid, user.role)
                      }
                      disabled={updatingId === user.uid}
                      className="bg-blue-600 px-3 py-1 rounded disabled:opacity-50"
                    >
                      ⬆ ترقية
                    </button>
                  ) : (
                    <span className="text-gray-500">
                      أعلى صلاحية
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
