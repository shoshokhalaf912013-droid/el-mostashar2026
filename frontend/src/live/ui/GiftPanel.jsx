import React from "react"

export default function GiftPanel({ role, sendGift }) {

  if(role !== "teacher" && role !== "admin"){
    return null
  }

  return (

    <div className="gift-panel">

      <button onClick={() => sendGift("⭐")}>⭐</button>

      <button onClick={() => sendGift("🏆")}>🏆</button>

      <button onClick={() => sendGift("🎁")}>🎁</button>

    </div>

  )

}