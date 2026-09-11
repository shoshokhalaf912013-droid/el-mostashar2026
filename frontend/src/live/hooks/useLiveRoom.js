import { useRoomContext } from "@livekit/components-react"
import { useEffect, useState } from "react"

export default function useLiveRoom() {

  const room = useRoomContext()

  const [participants,setParticipants] = useState([])
  const [connected,setConnected] = useState(false)

  useEffect(()=>{

    if(!room) return

    const updateParticipants = ()=>{

      const remote = Array.from(room.remoteParticipants.values())
      setParticipants(remote)

    }

    const handleConnected = ()=>{
      setConnected(true)
      updateParticipants()
    }

    const handleDisconnected = ()=>{
      setConnected(false)
    }

    // حالة الاتصال
    if(room.state === "connected"){
      setConnected(true)
      updateParticipants()
    }

    room.on("connected",handleConnected)
    room.on("disconnected",handleDisconnected)

    room.on("participantConnected",updateParticipants)
    room.on("participantDisconnected",updateParticipants)

    return ()=>{

      room.off("connected",handleConnected)
      room.off("disconnected",handleDisconnected)

      room.off("participantConnected",updateParticipants)
      room.off("participantDisconnected",updateParticipants)

    }

  },[room])


  const toggleMic = async ()=>{

    if(!room) return

    const local = room.localParticipant
    const enabled = local.isMicrophoneEnabled

    await local.setMicrophoneEnabled(!enabled)

  }


  const toggleCamera = async ()=>{

    if(!room) return

    const local = room.localParticipant
    const enabled = local.isCameraEnabled

    await local.setCameraEnabled(!enabled)

  }


  const leaveRoom = async ()=>{

    if(!room) return

    await room.disconnect()

  }


  return {

    room,
    participants,
    connected,
    toggleMic,
    toggleCamera,
    leaveRoom

  }

}