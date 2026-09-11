// src/pages/Student/StudentProfile.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StudentProfile() {
  const navigate = useNavigate();
  const uid = JSON.parse(localStorage.getItem("user"))?.uid;

  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setStudent(snap.data());
      } else {
        alert("⚠️ لم يتم العثور على بيانات الحساب.");
      }
    };

    fetchStudent();
  }, [uid]);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">

      <div className="bg-[#111] w-[420px] p-8 rounded-2xl shadow-xl border border-yellow-600/40">

        <h2 className="text-center text-3xl font-bold mb-6 text-yellow-400">
          حساب الطالب
        </h2>

        {/* بطاقة البيانات */}
        <div className="space-y-4">

          <div className="p-4 rounded-xl bg-gray-900 border border-yellow-700">
            <p className="text-gray-400 text-sm">الاسم الكامل</p>
            <p className="text-xl font-bold">{student.fullName}</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-yellow-700">
            <p className="text-gray-400 text-sm">البريد الإلكتروني</p>
            <p className="text-lg">{student.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-yellow-700">
            <p className="text-gray-400 text-sm">رقم الهاتف</p>
            <p className="text-xl">{student.phone}</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-yellow-700">
            <p className="text-gray-400 text-sm">المرحلة الدراسية</p>
            <p className="text-xl">{student.grade}</p>
          </div>
        </div>

        {/* زر تعديل البيانات */}
        <button
          onClick={() => navigate("/student/setup")}
          className="mt-6 w-full py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 
                     text-black font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-500/40"
        >
          تعديل البيانات
        </button>

      </div>
    </div>
  );
}
