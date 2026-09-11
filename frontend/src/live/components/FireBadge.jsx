import React from "react"

export default function FireBadge({ student }) {

  if (!student.score || student.score < 1000) return null

  return (

    <div className="fire-badge">

      🔥 {student.name} is on Fire

    </div>

  )

}