import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function UsersAdmin() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);

  // 🔒 حماية الصفحة
  if (!isSuperAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
    });

    return () => unsub();
  }, []);

  const changeRole = async (uid, newRole) => {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { role: newRole });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">إدارة المستخدمين</h1>

      <table className="w-full text-sm border">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2 border">البريد</th>
            <th className="p-2 border">الدور الحالي</th>
            <th className="p-2 border">تغيير الدور</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2 border">{u.email || "—"}</td>
              <td className="p-2 border font-bold">{u.role || "student"}</td>
              <td className="p-2 border">
                <select
                  defaultValue={u.role || "student"}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="bg-black text-white p-1 rounded"
                >
                  <option value="student">طالب</option>
                  <option value="teacher">معلم</option>
                  <option value="admin">مشرف</option>
                  <option value="super-admin">سوبر أدمن</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
