// src/pages/Student/LiveSessionView.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // استيراد Firestore

const LiveSessionView = ({ sessionId }) => {
  const [session, setSession] = useState(null); // حالة الجلسة

  useEffect(() => {
    // اشتراك في التحديثات الفورية من Firestore
    const unsubscribe = db
      .collection("liveSessions")
      .doc(sessionId)
      .onSnapshot((doc) => {
        setSession(doc.data()); // تحديث الحالة عند تغيير الجلسة
      });

    // إلغاء الاشتراك عند مغادرة الصفحة
    return () => unsubscribe();
  }, [sessionId]);

  return (
    <div>
      {session ? (
        <div>
          <h2>{session.title}</h2>
          <p>Status: {session.status}</p>
          {session.status === "live" && <p>الجلسة حية الآن!</p>}
        </div>
      ) : (
        <p>جاري تحميل الجلسة...</p>
      )}
    </div>
  );
};

export default LiveSessionView;