import React, { useEffect, useRef } from "react"

export default function StudentFrame({
  participant,
  active,
  onCall
}) {

  const videoRef = useRef()

  useEffect(() => {

    if (!participant) return

    const tracks = Array.from(
      participant.videoTracks?.values() || []
    )

    if (tracks.length > 0) {

      const track = tracks[0].track

      if (track && videoRef.current) {
        track.attach(videoRef.current)
      }

    }

  }, [participant])

  if (!participant) return null

  return (

    <div
      className={`student-frame ${active ? "active-student" : ""}`}
      onClick={onCall}
    >

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />

      {(!participant?.isCameraEnabled || !participant?.videoTracks?.size) && (

        <div className="student-name">
          {participant?.identity || "طالب"}
        </div>

      )}

      {active && (

        <div className="answer-badge">
          يجيب الآن ✏️
        </div>

      )}

    </div>

  )

}