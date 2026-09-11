import React from "react"
import StudentFrame from "./StudentFrame.jsx"

const socket = { emit: () => {} }

export default function StudentsSidebar({
  participants,
  cups,
  giveCup,
  getReward
}) {

  const sendReaction = (type) => {
    socket.emit("reaction", type)
  }

  if (!participants || participants.length === 0) {
    return (
      <div className="students-sidebar">
        <div className="sidebar-title">Students</div>

        <div className="no-students">
          No students yet
        </div>

        <div className="reactions-bar">

          <button onClick={() => sendReaction("clap")}>👏</button>
          <button onClick={() => sendReaction("fire")}>🔥</button>
          <button onClick={() => sendReaction("like")}>👍</button>
          <button onClick={() => sendReaction("heart")}>❤️</button>
          <button onClick={() => sendReaction("star")}>⭐</button>

        </div>

      </div>
    )
  }

  return (

    <div className="students-sidebar">

      <div className="sidebar-title">
        Students ({participants.length})
      </div>

      <div className="reactions-bar">

        <button onClick={() => sendReaction("clap")}>👏</button>
        <button onClick={() => sendReaction("fire")}>🔥</button>
        <button onClick={() => sendReaction("like")}>👍</button>
        <button onClick={() => sendReaction("heart")}>❤️</button>
        <button onClick={() => sendReaction("star")}>⭐</button>

      </div>

      <div className="students-list">

        {participants.map((student) => {

          const reward = getReward ? getReward(student.identity) : null
          const cupsCount = cups[student.identity] || 0

          return (

            <div
              key={student.identity}
              className="student-row"
            >

              <StudentFrame participant={student} />

              <div className="student-info">

                <div className="student-name">
                  {student.identity}
                </div>

                <div className="student-cups">
                  🏆 {cupsCount}
                </div>

                <button
                  className="cup-btn"
                  onClick={() => giveCup(student.identity)}
                >
                  Give Cup
                </button>

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}