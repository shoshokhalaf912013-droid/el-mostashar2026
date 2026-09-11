import "./LiveClassRoom.css";
import { useState, useEffect } from "react";

import EventBus from "../core/EventBus";

import VideoRoom from "../video/VideoRoom";
import TeacherCamera from "../video/TeacherCamera";

import Whiteboard from "../board/Whiteboard";
import BiologyLab from "../labs/biology/BiologyLab";

export default function LiveClassroom({
  token,
  url,
}) {

  const [teacherTrack, setTeacherTrack] = useState(null);
  const [showLab, setShowLab] = useState(false);

  /* ==========================================
     EVENTS
  ========================================== */

  useEffect(() => {

    const handleToggleLab = () => {
      setShowLab(prev => !prev);
    };

    EventBus.on(
      "TOGGLE_LAB",
      handleToggleLab
    );

    return () => {
      EventBus.off(
        "TOGGLE_LAB",
        handleToggleLab
      );
    };

  }, []);


  /* ==========================================
     LIVEKIT DATA
  ========================================== */

  if (!token || !url) {

    return (
      <div className="loading">
        🔄 Connecting to LiveKit...
      </div>
    );

  }


  /* ==========================================
     CLASSROOM
  ========================================== */

  return (
    <div className="live-container">

      {/* ======================================
          VIDEO
      ====================================== */}

      <div className="video-layer">

        <VideoRoom
          token={token}
          serverUrl={url}
          onTrack={(track) => {
            setTeacherTrack(track);
          }}
        />

      </div>


      {/* ======================================
          WHITEBOARD
      ====================================== */}

      <div className="whiteboard-layer">

        <Whiteboard />

      </div>


      {/* ======================================
          TEACHER CAMERA
      ====================================== */}

      <div className="teacher-layer">

        <TeacherCamera
          track={teacherTrack}
        />

      </div>


      {/* ======================================
          BIOLOGY LAB
      ====================================== */}

      {showLab && (

        <div className="lab-layer">

          <BiologyLab />

        </div>

      )}

    </div>
  );
}