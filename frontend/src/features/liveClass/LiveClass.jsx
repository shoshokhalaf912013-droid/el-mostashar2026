import { useEffect, useState } from "react";
import { connect } from "livekit-client";

import Whiteboard from "./Whiteboard";
import StudentGrid from "./StudentGrid";
import TeacherCamera from "./TeacherCamera";
import LiveControls from "./LiveControls";

export default function LiveClass({ roomName, username }) {

  const [room, setRoom] = useState(null)

  useEffect(() => {

    const joinRoom = async () => {

      try {

        // طلب التوكن من Firebase
        const res = await fetch(
          `https://us-central1-el-mostashar2026.cloudfunctions.net/getToken?room=${roomName}&username=${username}`
        )

        const data = await res.json()

        // الاتصال بـ LiveKit
        const roomInstance = await connect(
          data.url.trim(),
          data.token
        )

        setRoom(roomInstance)

      } catch (err) {
        console.error("LiveKit error:", err)
      }

    }

    joinRoom()

  }, [roomName, username])

  if (!room) return <div>Connecting to class...</div>

  return (

    <div className="live-class">

      {/* كاميرا المعلم */}
      <TeacherCamera room={room} />

      {/* السبورة */}
      <Whiteboard />

      {/* الطلاب */}
      <StudentGrid room={room} />

      {/* أدوات التحكم */}
      <LiveControls room={room} />

    </div>

  )

}