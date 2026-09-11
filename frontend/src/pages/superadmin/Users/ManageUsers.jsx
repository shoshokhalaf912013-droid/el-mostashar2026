import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, UserCog, Trash2 } from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    // 📌 بيانات تجريبية – لاحقًا تستبدلها بالـ API
    setUsers([
      { id: 1, name: "محمد علي", email: "mohamed@example.com", role: "student" },
      { id: 2, name: "سارة حسن", email: "sara@example.com", role: "teacher" },
      { id: 3, name: "أحمد محمود", email: "ahmed@example.com", role: "admin" },
      { id: 4, name: "خالد عبد الله", email: "khaled@example.com", role: "student" },
    ]);
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === "all" ? true : u.role === filterRole;

    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 text-white min-h-screen">

      {/* Title + Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>

        <Link
          to="/super/users/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition"
        >
          <Plus size={20} />
          إضافة مستخدم
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 p-4 rounded-xl mb-5 flex flex-wrap gap-4">

        {/* Search */}
        <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg flex-1 min-w-[250px]">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            className="bg-transparent w-full focus:outline-none px-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <select
          className="bg-gray-800 px-4 py-2 rounded-lg"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">كل الأدوار</option>
          <option value="student">طالب</option>
          <option value="teacher">مدرس</option>
          <option value="admin">أدمن</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-900 rounded-xl overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-right">#</th>
              <th className="py-3 px-4 text-right">الاسم</th>
              <th className="py-3 px-4 text-right">البريد</th>
              <th className="py-3 px-4 text-right">الدور</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4">{u.id}</td>
                  <td className="py-3 px-4">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm ${
                        u.role === "admin"
                          ? "bg-red-600"
                          : u.role === "teacher"
                          ? "bg-purple-600"
                          : "bg-green-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center flex justify-center gap-3">
                    <Link
                      to={`/super/users/edit/${u.id}`}
                      className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl transition"
                    >
                      <UserCog size={18} />
                    </Link>

                    <button className="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="py-6 text-center text-gray-400 text-lg"
                >
                  لا يوجد مستخدمين مطابقين
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
