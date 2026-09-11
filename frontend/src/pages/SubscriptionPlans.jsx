import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const plans = {
  history: {
    monthly: 120,
    term: 300,
    yearly: 500,
  },
  geography: {
    monthly: 100,
    term: 250,
    yearly: 450,
  },
};

export default function Subscription() {
  const [subject, setSubject] = useState("");
  const [plan, setPlan] = useState("");
  const [processing, setProcessing] = useState(false);

  const subscribe = async () => {
    if (!subject || !plan) return alert("اختر المادة ونوع الاشتراك");

    const user = auth.currentUser;
    if (!user) return alert("سجل الدخول أولًا");

    setProcessing(true);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`subscriptions.${subject}`]: {
          active: true,
          plan,
          expiry: "2026-12-31", 
        }
      });

      alert("💰 تم تفعيل الاشتراك بنجاح!");
    } catch (error) {
      alert("حدث خطأ");
      console.log(error);
    }

    setProcessing(false);
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">🔑 الاشتراكات</h1>

      <select onChange={(e) => setSubject(e.target.value)} className="mb-3 p-2 border rounded">
        <option>اختر المادة</option>
        <option value="history">📘 تاريخ</option>
        <option value="geography">🌍 جغرافيا</option>
      </select>

      {subject && (
        <select onChange={(e) => setPlan(e.target.value)} className="mb-3 p-2 border rounded block mx-auto">
          <option>اختر نوع الاشتراك</option>
          <option value="monthly">شهري - {plans[subject].monthly} جنيه</option>
          <option value="term">ترم - {plans[subject].term} جنيه</option>
          <option value="yearly">سنة - {plans[subject].yearly} جنيه</option>
        </select>
      )}

      <button
        onClick={subscribe}
        disabled={processing}
        className="bg-green-600 text-white px-5 py-2 rounded"
      >
        {processing ? "جارى التفعيل..." : "تفعيل الاشتراك"}
      </button>
    </div>
  );
}
