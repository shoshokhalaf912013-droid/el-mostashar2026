// ============================================
// File: src/pages/Teacher/LiveRoom.jsx
// ============================================

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { changeLiveMode } from "../../services/liveModeService";

export default function LiveRoom() {
  const [liveUrl, setLiveUrl] = useState(null);
  const [mode, setMode] = useState("explanation");

  // الاستماع لحالة اللايف
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "liveSession", "current"),
      (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();

        setLiveUrl(data.videoUrl);
        setMode(data.mode || "explanation");
      }
    );

    return () => unsub();
  }, []);

  // تغيير وضع الحصة
  const handleModeChange = async (newMode) => {
    setMode(newMode);
    await changeLiveMode(newMode);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎥 غرفة اللايف - المعلم</h1>

      {/* أزرار الوضع */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => handleModeChange("explanation")}>
          🟢 شرح
        </button>

        <button onClick={() => handleModeChange("review")}>
          🟡 مراجعة
        </button>

        <button onClick={() => handleModeChange("practice")}>
          🔵 تدريب
        </button>
      </div>

      {/* عرض الحالة الحالية */}
      <h2>
        {mode === "explanation" && "🟢 وضع الشرح"}
        {mode === "review" && "🟡 وضع المراجعة"}
        {mode === "practice" && "🔵 وضع التدريب"}
      </h2>

      {/* فيديو اللايف */}
      {liveUrl && (
        <iframe
          width="100%"
          height="500"
          src={liveUrl}
          title="Teacher Live"
          allowFullScreen
        />
      )}
    </div>
  );
}