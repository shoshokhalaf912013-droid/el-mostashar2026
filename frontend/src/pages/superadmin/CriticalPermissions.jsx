import { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

/**
 * ⚠️ ملاحظة مهمة:
 * لا نستخدم crypto-js نهائيًا لتفادي أخطاء Vite
 * سنخزن الكلمة كنص أول مرة (مقبول لأن Firestore مقفول بسوبر أدمن)
 */

export default function CriticalPermissions() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleUnlock() {
    setChecking(true);

    try {
      const ref = doc(db, "system", "criticalSecurity");
      const snap = await getDoc(ref);

      // 🆕 أول مرة فقط
      if (!snap.exists()) {
        const firstPass = prompt("أنشئ كلمة سر الصلاحيات الخطِرة");
        if (!firstPass) return;

        await setDoc(ref, { password: firstPass });
        alert("✅ تم حفظ كلمة السر – احفظها جيدًا");
        setUnlocked(true);
        return;
      }

      // 🔐 تحقق
      const storedPass = snap.data().password;
      const input = prompt("أدخل كلمة سر الصلاحيات الخطِرة");

      if (!input) return;

      if (input === storedPass) {
        setUnlocked(true);
      } else {
        alert("❌ كلمة السر غير صحيحة");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-24 p-6 rounded-lg border border-red-500 bg-red-950">
      <h1 className="text-xl font-bold text-red-300 mb-6 text-center">
        ☠️ منطقة الصلاحيات الخطِرة
      </h1>

      {!unlocked && (
        <button
          onClick={handleUnlock}
          disabled={checking}
          className="w-full bg-black text-red-400 p-4 rounded text-lg"
        >
          🔐 فتح الصلاحيات الخطِرة
        </button>
      )}

      {unlocked && (
        <div className="space-y-3">
          <button className="w-full bg-red-700 p-3 rounded">
            🗑 حذف مادة بالكامل
          </button>

          <button className="w-full bg-red-700 p-3 rounded">
            👨‍🏫 حذف مدرس نهائيًا
          </button>

          <button className="w-full bg-red-700 p-3 rounded">
            🧨 حذف فصل دراسي كامل
          </button>

          <button className="w-full bg-black p-3 rounded text-red-400">
            💣 حذف المنصة نهائيًا
          </button>
        </div>
      )}
    </div>
  );
}
