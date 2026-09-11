import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import "./Live.css";

export default function StudentLivePage() {

  const [liveData, setLiveData] = useState(null);

  useEffect(() => {

    const ref = doc(db, "liveSession", "current");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setLiveData(snap.data());
      }
    });

    return () => unsub();

  }, []);

  if (!liveData || !liveData.isLive) {
    return (
      <div className="live-page">
        <h2>📡 لا يوجد بث مباشر الآن</h2>
      </div>
    );
  }

  return (
    <div className="live-page">
      <h2>🎥 البث المباشر</h2>

      <div className="video-wrapper">
        <iframe
          src={liveData.videoUrl}
          allowFullScreen
          title="Student Live"
        />
      </div>
    </div>
  );
}