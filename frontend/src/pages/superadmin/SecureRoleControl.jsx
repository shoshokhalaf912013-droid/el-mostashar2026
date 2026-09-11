import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function SecureRoleControl() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 الإيميل الوحيد المصرح له
  const ALLOWED_EMAIL = "khalafmahrous2000@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* ⏳ تحميل */
  if (loading) {
    return (
      <div className="p-8 text-center text-yellow-400 text-lg">
        ⏳ جاري التحقق من الصلاحيات...
      </div>
    );
  }

  /* ❌ غير مسجل */
  if (!user) {
    return (
      <div className="p-8 text-center text-red-500 text-lg">
        ❌ غير مسجل دخول
      </div>
    );
  }

  /* 🚫 ليس الإيميل المسموح */
  if (user.email !== ALLOWED_EMAIL) {
    return (
      <div className="p-8 text-center text-red-500 font-bold text-lg">
        🚫 هذه الصفحة غير مصرح بها لك
      </div>
    );
  }

  /* ✅ الحالة الصحيحة */
  return (
    <div className="p-8 max-w-xl mx-auto mt-10
      bg-black border border-yellow-500 rounded-xl shadow-lg">

      <h1 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
        🔐 لوحة التحكم الصامتة
      </h1>

      <div className="space-y-4 text-sm text-gray-200">
        <div>
          <span className="text-yellow-400">📧 الإيميل:</span>
          <div className="break-all">{user.email}</div>
        </div>

        <div>
          <span className="text-yellow-400">🆔 UID:</span>
          <div className="break-all">{user.uid}</div>
        </div>

        <div className="mt-6 p-4 border border-green-500 rounded-lg
          text-green-400 text-center font-bold">
          ✅ تم التحقق بنجاح – الصفحة تعمل بشكل صحيح
        </div>
      </div>
    </div>
  );
}
