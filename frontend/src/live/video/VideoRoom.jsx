import { useEffect, useRef } from "react"
import { Room, RoomEvent, Track } from "livekit-client"
import EventBus from "../core/EventBus"

export default function VideoRoom({ token, serverUrl, onTrack }) {

  const roomRef = useRef(null)

  useEffect(() => {

    async function startRoom() {

      const room = new Room()
      roomRef.current = room

      try {

        // 🔗 الاتصال
        await room.connect(serverUrl, token)
        console.log("✅ Connected to LiveKit")

        // =========================
        // 🎥 تشغيل الكاميرا والمايك
        // =========================
        try {
          await room.localParticipant.enableCameraAndMicrophone()
          console.log("🎥 Camera & Mic ON")
        } catch (err) {
          console.warn("⚠️ No camera → fallback", err)
        }

        // =========================
        // 📡 استقبال التراكات
        // =========================
        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {

          console.log("📡 Track received from:", participant.identity)

          if (track.kind === Track.Kind.Video) {
            onTrack(track)
          }

        })

        // =========================
        // 👤 دخول مستخدم
        // =========================
        room.on(RoomEvent.ParticipantConnected, (participant) => {
          console.log("👤 Joined:", participant.identity)
          EventBus.emit("USER_JOINED", participant)
        })

        // =========================
        // ❌ خروج
        // =========================
        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log("❌ Left:", participant.identity)
          EventBus.emit("USER_LEFT", participant.sid)
        })

      } catch (err) {
        console.error("❌ Connection error:", err)
      }

    }

    startRoom()

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect()
      }
    }

  }, [token, serverUrl])

  return null
}