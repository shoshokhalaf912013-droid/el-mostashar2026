import React from "react"

export default function Leaderboard({ board }) {

  return (

    <div className="leaderboard">

      <h3>🏆 Leaderboard</h3>

      {board.slice(0,5).map((s,index)=>(

        <div key={s.id} className="leader-row">

          <span>

            {index === 0 && "🥇"}
            {index === 1 && "🥈"}
            {index === 2 && "🥉"}

            {index > 2 && index+1}

          </span>

          <span>{s.id}</span>

          <span>{s.score} pts</span>

        </div>

      ))}

    </div>

  )

}