import React from "react";
import { Link } from "react-router-dom";

export default function Tests() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[var(--gold)]">الاختبارات المتاحة</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold">اختبار تجريبي - تاريخ</h3>
          <p className="text-sm text-[rgba(255,255,255,0.6)]">المدة: 30 دقيقة</p>
          <Link to="/exam/history2026" className="mt-3 inline-block btn-gold">ابدأ الامتحان</Link>
        </div>
      </div>
    </div>
  );
}
