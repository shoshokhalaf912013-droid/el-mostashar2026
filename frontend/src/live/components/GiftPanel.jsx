import React from "react"

export default function GiftPanel({ sendGift }) {

  return (

    <div>

      <button onClick={() => sendGift("⭐")}>⭐</button>

      <button onClick={() => sendGift("🏆")}>🏆</button>

      <button onClick={() => sendGift("🎁")}>🎁</button>

    </div>

  )
}