import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../contexts/AuthContext";
import "./Live.css";

export default function TeacherLivePage() {

  const { user } = useAuth();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const liveRef = doc(db, "liveSession", "current");

  /* ================= LOAD ================= */
  useEffect(() => {
    const loadLive = async () => {
      const snap = await getDoc(liveRef);

      if (snap.exists()) {
        const data = snap.data();
        setYoutubeUrl(data.youtubeUrl || "");
        setIsLive(data.isLive || false);
      }
    };

    loadLive();
  }, []);

  /* ================= EMBED ================= */
  const convertToEmbed = (url) => {
    if (!url) return "";

    if (url.includes("watch?v="))
      return url.replace("watch?v=", "embed/");

    if (url.includes("youtu.be/"))
      return url.replace("youtu.be/", "youtube.com/embed/");

    return url;
  };

  /* ================= ACTIONS ================= */

  const saveLink = async () => {
    setLoading(true);

    await setDoc(liveRef, {
      youtubeUrl,
      videoUrl: convertToEmbed(youtubeUrl),
      status: "waiting",
      isLive: false,
      teacherId: user.uid,
      updatedAt: new Date()
    }, { merge: true });

    setLoading(false);
    alert("✅ تم حفظ الرابط");
  };

  const startLive = async () => {
    setLoading(true);

    await setDoc(liveRef, {
      status: "live",
      isLive: true,
      startedAt: new Date(),
      teacherId: user.uid
    }, { merge: true });

    setIsLive(true);
    setLoading(false);
    alert("🎥 بدأ البث");
  };

  const endLive = async () => {
    setLoading(true);

    await setDoc(liveRef, {
      status: "ended",
      isLive: false,
      endedAt: new Date()
    }, { merge: true });

    setIsLive(false);
    setLoading(false);
    alert("⛔ تم إنهاء البث");
  };

  return (
    <div className="live-page">

      <div className="live-card">

        <h2 className="live-title">🎥 إدارة البث المباشر</h2>

        <input
          className="live-input"
          placeholder="ضع رابط بث YouTube..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />

        <div className="live-buttons">

          <button className="gold-btn"
            onClick={saveLink}
            disabled={loading}>
            حفظ الرابط
          </button>

          <button className="gold-btn"
            onClick={startLive}
            disabled={loading}>
            ▶ بدء البث
          </button>

          <button className="gold-btn danger"
            onClick={endLive}
            disabled={loading}>
            ⛔ إنهاء البث
          </button>

        </div>

        {isLive && youtubeUrl && (
          <div className="video-wrapper">
            <iframe
              src={convertToEmbed(youtubeUrl)}
              allowFullScreen
              title="Live"
            />
          </div>
        )}

      </div>
    </div>
  );
}