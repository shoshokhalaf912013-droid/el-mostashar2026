import React, { useState } from "react"

export default function HandRaiseButton() {

  const [raised, setRaised] = useState(false)

  function toggle() {
    setRaised(!raised)
  }

  return (

    <button onClick={toggle}>

      {raised ? "✋ Raised" : "Raise Hand"}

    </button>

  )
}