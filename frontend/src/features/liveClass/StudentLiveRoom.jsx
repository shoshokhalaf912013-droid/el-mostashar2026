import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { sendStudentPulse } from "./services/livePulse.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentLiveRoom({ classId }) {

  const auth = getAuth();
  const studentId = auth.currentUser?.uid;

  const navigate = useNavigate();
  const { role } = useAuth();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [handRaised, setHandRaised] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);

  const isSuperAdmin = role === "super-admin";
  const isStudent = role === "student";

  /* ================= AUTO PULSE ================= */

  useEffect(() => {

    if (!classId || !studentId) return;

    const interval = setInterval(() => {
      sendStudentPulse(
        classId,
        studentId,
        handRaised ? "hand" : "focused"
      );
    }, 5000);

    return () => clearInterval(interval);

  }, [handRaised, classId, studentId]);

  /* ================= MEDIA ================= */

  const startMedia = async () => {

    try {

      const constraints = {
        video: isSuperAdmin ? true : false,
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;

      // كاميرا فقط للسوبر ادمن
      if (videoRef.current && isSuperAdmin) {
        videoRef.current.srcObject = stream;
      }

      setMicOn(true);

      if (isSuperAdmin) {
        setCamOn(true);
      }

    } catch (err) {

      console.error("Media Error:", err);

      alert("يجب السماح باستخدام الميكروفون");

    }

  };

  const toggleMic = () => {

    if (!streamRef.current) return;

    const audioTrack = streamRef.current.getAudioTracks()[0];

    audioTrack.enabled = !audioTrack.enabled;

    setMicOn(audioTrack.enabled);

  };

  const toggleCam = () => {

    if (!isSuperAdmin || !streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];

    videoTrack.enabled = !videoTrack.enabled;

    setCamOn(videoTrack.enabled);

  };

  /* ================= HAND ================= */

  const raiseHand = async () => {

    setHandRaised(true);

    await sendStudentPulse(
      classId,
      studentId,
      "hand"
    );

  };

  const lowerHand = async () => {

    setHandRaised(false);

    await sendStudentPulse(
      classId,
      studentId,
      "focused"
    );

  };

  /* ================= LEAVE ================= */

  const leaveRoom = () => {

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    navigate(-1);

  };

  /* ================= UI ================= */

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <h2>🔴 بث مباشر</h2>

        <div>
          {handRaised
            ? "✋ رفعت يدك"
            : "👀 تتابع الدرس"}
        </div>

      </div>

      {/* VIDEO */}

      <div style={styles.videoArea}>

        {isSuperAdmin && camOn ? (

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />

        ) : (

          <div style={styles.placeholder}>
            🎥 الكاميرا تحت تحكم الإدارة
          </div>

        )}

      </div>

      {/* CONTROLS */}

      <div style={styles.controls}>

        <button
          style={styles.goldBtn}
          onClick={startMedia}
        >
          🎬 تشغيل الصوت
        </button>

        <button
          style={micOn ? styles.activeBtn : styles.darkBtn}
          onClick={toggleMic}
        >
          🎤 {micOn ? "كتم" : "تشغيل"}
        </button>

        {isSuperAdmin && (

          <button
            style={camOn ? styles.activeBtn : styles.darkBtn}
            onClick={toggleCam}
          >
            📷 {camOn ? "إيقاف" : "تشغيل"}
          </button>

        )}

        {isStudent && !handRaised && (

          <button
            style={styles.goldBtn}
            onClick={raiseHand}
          >
            ✋ رفع اليد
          </button>

        )}

        {isStudent && handRaised && (

          <button
            style={styles.darkBtn}
            onClick={lowerHand}
          >
            ⬇ خفض اليد
          </button>

        )}

        <button
          style={styles.leaveBtn}
          onClick={leaveRoom}
        >
          🚪 مغادرة
        </button>

      </div>

    </div>

  );

}

/* ================= STYLES ================= */

const styles = {

  container: {
    minHeight: "100vh",
    background: "#0d0d0d",
    color: "white",
    display: "flex",
    flexDirection: "column"
  },

  header: {
    padding: "20px 30px",
    background: "#111",
    display: "flex",
    justifyContent: "space-between"
  },

  videoArea: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#000"
  },

  video: {
    width: "70%",
    borderRadius: "20px"
  },

  placeholder: {
    color: "#777",
    fontSize: "20px"
  },

  controls: {
    padding: 20,
    display: "flex",
    justifyContent: "center",
    gap: 15,
    flexWrap: "wrap",
    background: "#111"
  },

  goldBtn: {
    background: "#ffcc00",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer"
  },

  darkBtn: {
    background: "#333",
    color: "white",
    padding: "10px 20px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer"
  },

  activeBtn: {
    background: "#00c853",
    color: "white",
    padding: "10px 20px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer"
  },

  leaveBtn: {
    background: "#d50000",
    color: "white",
    padding: "10px 20px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer"
  }

};