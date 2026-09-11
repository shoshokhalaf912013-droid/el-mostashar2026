// src/components/DailyWelcome.jsx

import { useEffect, useState } from "react";

export default function DailyWelcome({ user }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toDateString();
    const lastShown = localStorage.getItem("welcomeShown");

    // يظهر مرة واحدة يومياً فقط
    if (lastShown !== today) {
      setShow(true);
      localStorage.setItem("welcomeShown", today);
    }
  }, [user]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0f172a] text-white rounded-2xl p-8 text-center shadow-2xl w-[90%] max-w-md animate-fadeIn">

        <h2 className="text-2xl font-bold mb-3">
          👋 أهلاً بعودتك
        </h2>

        <p className="text-gray-300 mb-6">
          نتمنى لك تجربة تعليمية ممتعة داخل منصة المستشار
        </p>

        <button
          onClick={() => setShow(false)}
          className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:scale-105 transition"
        >
          دخول المنصة
        </button>
      </div>
    </div>
  );
}
