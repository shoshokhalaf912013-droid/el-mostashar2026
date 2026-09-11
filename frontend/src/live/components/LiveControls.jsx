import React from "react"

export default function LiveControls({
  toggleMic,
  toggleCamera,
  leaveRoom
}) {

  return (

    <div className="controls">

      <button
        onClick={toggleMic}
        className="control-btn"
      >
        🎤 Mic
      </button>

      <button
        onClick={toggleCamera}
        className="control-btn"
      >
        📷 Camera
      </button>

      <button
        onClick={leaveRoom}
        className="control-btn leave"
      >
        ❌ Leave
      </button>

    </div>

  )

}