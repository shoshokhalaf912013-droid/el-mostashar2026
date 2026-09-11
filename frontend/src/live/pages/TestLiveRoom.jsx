import React, { useEffect, useRef } from "react"
import { Room } from "livekit-client"

export default function TestLiveRoom() {

  const videoRef = useRef(null)

  useEffect(() => {

    const connect = async () => {

      const room = new Room()

      // طلب التوكن من Firebase
      const res = await fetch(
        "https://us-central1-el-mostashar2026.cloudfunctions.net/getToken"
      )

      const data = await res.json()

      // الاتصال بـ LiveKit
      await room.connect(data.url.trim(), data.token)

      // تشغيل الكاميرا والمايك
      await room.localParticipant.enableCameraAndMicrophone()

      // عرض الفيديو
      const tracks = room.localParticipant.videoTracks

      tracks.forEach(pub => {

        const track = pub.track

        if (track && videoRef.current) {
          track.attach(videoRef.current)
        }

      })

    }

    connect()

  }, [])

  return (

    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111"
      }}
    >

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "500px",
          borderRadius: "12px"
        }}
      />

    </div>

  )

}