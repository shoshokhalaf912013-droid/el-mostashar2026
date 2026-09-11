import React, { useState } from "react";

export default function SA_AddUser() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`تم إضافة المستخدم: ${name} - الدور: ${role}`);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">إضافة مستخدم جديد</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl shadow-xl max-w-lg"
      >
        <div className="mb-4">
          <label className="block mb-1 font-semibold">اسم المستخدم</label>
          <input
            type="text"
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">الدور</label>
          <select
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">طالب</option>
            <option value="teacher">مدرس</option>
            <option value="admin">أدمن</option>
          </select>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
          إضافة المستخدم
        </button>
      </form>
    </div>
  );
}
