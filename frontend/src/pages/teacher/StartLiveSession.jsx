// src/pages/Teacher/StartLiveSession.jsx
import React, { useState } from "react";
import { startLiveSession } from "../../firebase/firestore"; // استيراد دالة بدء الجلسة

const StartLiveSession = ({ sessionId }) => {
  const [loading, setLoading] = useState(false); // حالة التحميل عند بدء الجلسة

  const handleStartSession = async () => {
    setLoading(true);
    try {
      await startLiveSession(sessionId); // بدء الجلسة في Firestore
      alert("تم بدء الجلسة بنجاح!");
    } catch (error) {
      console.error("خطأ في بدء الجلسة:", error);
      alert("حدث خطأ أثناء بدء الجلسة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleStartSession}
        disabled={loading} // تعطيل الزر أثناء التحميل
        className="btn btn-primary"
      >
        {loading ? "جاري البدء..." : "ابدأ الجلسة"}
      </button>
    </div>
  );
};

export default StartLiveSession;