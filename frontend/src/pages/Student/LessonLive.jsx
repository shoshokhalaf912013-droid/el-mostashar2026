// ============================================
// File: src/pages/Student/LessonLive.jsx
// ============================================

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function LessonLive() {
  const [liveUrl, setLiveUrl] = useState(null);
  const [liveMode, setLiveMode] = useState("explanation");

  // الاستماع للحصة المباشرة
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "liveSession", "current"),
      (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();

        if (data.islive) {
          setLiveUrl(data.videoUrl);
          setLiveMode(data.mode || "explanation");
        } else {
          setLiveUrl(null);
        }
      }
    );

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📚 الحصة المباشرة</h1>

      {/* حالة الحصة */}
      <h2>
        {liveMode === "explanation" && "🟢 المعلم يشرح الآن"}
        {liveMode === "review" && "🟡 وقت المراجعة"}
        {liveMode === "practice" && "🔵 وقت التدريب"}
      </h2>

      {/* فيديو اللايف */}
      {liveUrl ? (
        <iframe
          width="100%"
          height="500"
          src={liveUrl}
          title="Student Live"
          allowFullScreen
        />
      ) : (
        <p>⏳ لا توجد حصة مباشرة الآن</p>
      )}
    </div>
  );
}