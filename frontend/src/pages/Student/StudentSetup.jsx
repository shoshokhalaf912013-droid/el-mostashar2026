// src/pages/Student/StudentSetup.jsx
import React, { useState } from "react";
import { db } from "../../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StudentSetup() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const navigate = useNavigate();

  const uid = JSON.parse(localStorage.getItem("user"))?.uid;

  const handleSave = async () => {
    if (!fullName || !phone || !grade) {
      alert("⚠️ من فضلك أكمل جميع الحقول");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        await updateDoc(userRef, {
          fullName,
          phone,
          grade,
          profileCompleted: true,
        });
      }

      alert("✅ تم حفظ بياناتك بنجاح!");
      navigate("/student/profile");
    } catch (error) {
      alert("❌ خطأ غير متوقع: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="bg-[#111] p-8 rounded-2xl shadow-xl w-[380px] border border-yellow-600/40">

        <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">
          إعداد حساب الطالب
        </h2>

        {/* الاسم */}
        <div className="mb-5">
          <label className="block mb-2 text-yellow-300 font-semibold">الاسم الكامل</label>
          <input
            type="text"
            className="w-full p-3 rounded bg-gray-900 border border-yellow-700 text-white focus:ring-2 focus:ring-yellow-500"
            placeholder="اكتب اسمك هنا"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* الهاتف */}
        <div className="mb-5">
          <label className="block mb-2 text-yellow-300 font-semibold">رقم الهاتف</label>
          <input
            type="text"
            className="w-full p-3 rounded bg-gray-900 border border-yellow-700 text-white focus:ring-2 focus:ring-yellow-500"
            placeholder="رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* المرحلة */}
        <div className="mb-5">
          <label className="block mb-2 text-yellow-300 font-semibold">المرحلة الدراسية</label>

          <select
            className="w-full p-3 rounded bg-gray-900 border border-yellow-700 text-white focus:ring-2 focus:ring-yellow-500"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="">اختر المرحلة</option>
            <option value="اولى ثانوي">أولى ثانوي</option>
            <option value="تانية ثانوي">تانية ثانوي</option>
            <option value="تالته ثانوي">تالته ثانوي</option>
          </select>
        </div>

        {/* زر الحفظ */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 
                     text-black font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-500/40"
        >
          حفظ المعلومات
        </button>

      </div>
    </div>
  );
}
