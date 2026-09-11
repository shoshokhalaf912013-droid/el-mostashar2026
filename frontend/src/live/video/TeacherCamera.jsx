import { useRef, useEffect, useState } from "react"

export default function TeacherCamera({ track }) {

  const videoRef = useRef(null)
  const cameraRef = useRef(null)

  const [mode, setMode] = useState("small")

  const [position, setPosition] = useState({
    x: 40,
    y: 90
  })

  const [size, setSize] = useState({
    width: 260,
    height: 170
  })

  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)

  const dragOffset = useRef({
    x: 0,
    y: 0
  })

  const resizeStart = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })


  /* =========================================================
     LIVEKIT VIDEO
  ========================================================= */

  useEffect(() => {

    if (!track || !videoRef.current) return

    const container = videoRef.current

    container.innerHTML = ""

    const element = track.attach()

    element.autoplay = true
    element.muted = true
    element.playsInline = true

    element.style.width = "100%"
    element.style.height = "100%"
    element.style.objectFit = "cover"

    element.style.pointerEvents = "none"
    element.style.userSelect = "none"

    container.appendChild(element)

    return () => {

      try {

        track
          .detach()
          .forEach(el => el.remove())

      } catch (error) {

        console.warn(
          "Camera detach error:",
          error
        )

      }

    }

  }, [track])


  /* =========================================================
     DOUBLE CLICK
  ========================================================= */

  function handleDoubleClick(e) {

    e.preventDefault()
    e.stopPropagation()

    if (mode === "small") {

      setMode("medium")

      setSize({
        width: 420,
        height: 280
      })

      return
    }

    if (mode === "medium") {

      setMode("large")

      setSize({
        width: 650,
        height: 430
      })

      return
    }

    if (mode === "large") {

      setMode("small")

      setSize({
        width: 260,
        height: 170
      })

    }

  }


  /* =========================================================
     POINTER DOWN
     يبدأ السحب فقط من جسم الكاميرا
  ========================================================= */

  function handlePointerDown(e) {

    if (e.button !== 0) return

    if (mode === "full") return

    if (
      e.target.closest(".cameraControl") ||
      e.target.closest(".resizeHandle")
    ) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const camera = cameraRef.current

    if (!camera) return

    /*
       نمسك المؤشر بالكاميرا حتى لو خرج خارجها
    */

    try {
      camera.setPointerCapture(e.pointerId)
    } catch (error) {
      console.warn("Pointer capture failed:", error)
    }

    dragOffset.current = {

      x:
        e.clientX -
        position.x,

      y:
        e.clientY -
        position.y

    }

    setDragging(true)

  }


  /* =========================================================
     POINTER MOVE
  ========================================================= */

  function handlePointerMove(e) {

    if (!dragging) return

    e.preventDefault()
    e.stopPropagation()

    const newX =
      e.clientX -
      dragOffset.current.x

    const newY =
      e.clientY -
      dragOffset.current.y


    const maxX =
      Math.max(
        0,
        window.innerWidth -
        size.width
      )

    const maxY =
      Math.max(
        0,
        window.innerHeight -
        size.height
      )


    setPosition({

      x: Math.max(
        0,
        Math.min(
          newX,
          maxX
        )
      ),

      y: Math.max(
        0,
        Math.min(
          newY,
          maxY
        )
      )

    })

  }


  /* =========================================================
     POINTER UP
     ينهي السحب بشكل مضمون
  ========================================================= */

  function handlePointerUp(e) {

    e.preventDefault()
    e.stopPropagation()

    const camera = cameraRef.current

    if (camera) {

      try {

        if (
          camera.hasPointerCapture &&
          camera.hasPointerCapture(
            e.pointerId
          )
        ) {

          camera.releasePointerCapture(
            e.pointerId
          )

        }

      } catch (error) {

        console.warn(
          "Pointer release failed:",
          error
        )

      }

    }

    setDragging(false)

  }


  /* =========================================================
     POINTER CANCEL
  ========================================================= */

  function handlePointerCancel(e) {

    const camera = cameraRef.current

    if (camera) {

      try {

        if (
          camera.hasPointerCapture &&
          camera.hasPointerCapture(
            e.pointerId
          )
        ) {

          camera.releasePointerCapture(
            e.pointerId
          )

        }

      } catch (error) {

        console.warn(
          "Pointer cancel failed:",
          error
        )

      }

    }

    setDragging(false)

  }


  /* =========================================================
     RESIZE START
  ========================================================= */

  function handleResizePointerDown(e) {

    if (e.button !== 0) return

    if (mode === "full") return

    e.preventDefault()
    e.stopPropagation()

    const camera = cameraRef.current

    if (camera) {

      try {
        camera.setPointerCapture(
          e.pointerId
        )
      } catch (error) {
        console.warn(
          "Resize pointer capture failed:",
          error
        )
      }

    }

    resizeStart.current = {

      x: e.clientX,
      y: e.clientY,

      width: size.width,
      height: size.height

    }

    setResizing(true)

  }


  /* =========================================================
     RESIZE MOVE
  ========================================================= */

  function handleResizePointerMove(e) {

    if (!resizing) return

    e.preventDefault()
    e.stopPropagation()

    const deltaX =
      e.clientX -
      resizeStart.current.x

    const deltaY =
      e.clientY -
      resizeStart.current.y


    const newWidth =
      Math.max(
        180,
        resizeStart.current.width +
        deltaX
      )

    const newHeight =
      Math.max(
        110,
        resizeStart.current.height +
        deltaY
      )


    const maxWidth =
      window.innerWidth -
      position.x

    const maxHeight =
      window.innerHeight -
      position.y


    setSize({

      width: Math.min(
        newWidth,
        maxWidth
      ),

      height: Math.min(
        newHeight,
        maxHeight
      )

    })

  }


  /* =========================================================
     RESIZE END
  ========================================================= */

  function handleResizePointerUp(e) {

    e.preventDefault()
    e.stopPropagation()

    const camera = cameraRef.current

    if (camera) {

      try {

        if (
          camera.hasPointerCapture &&
          camera.hasPointerCapture(
            e.pointerId
          )
        ) {

          camera.releasePointerCapture(
            e.pointerId
          )

        }

      } catch (error) {

        console.warn(
          "Resize pointer release failed:",
          error
        )

      }

    }

    setResizing(false)

  }


  /* =========================================================
     PRESET SIZE
  ========================================================= */

  function setSmall(e) {

    e.preventDefault()
    e.stopPropagation()

    setMode("small")

    setSize({
      width: 260,
      height: 170
    })

  }


  function setMedium(e) {

    e.preventDefault()
    e.stopPropagation()

    setMode("medium")

    setSize({
      width: 420,
      height: 280
    })

  }


  function setLarge(e) {

    e.preventDefault()
    e.stopPropagation()

    setMode("large")

    setSize({
      width: 650,
      height: 430
    })

  }


  function setFull(e) {

    e.preventDefault()
    e.stopPropagation()

    setMode("full")

  }


  function exitFull(e) {

    e.preventDefault()
    e.stopPropagation()

    setMode("medium")

    setSize({
      width: 420,
      height: 280
    })

  }


  /* =========================================================
     CAMERA STYLE
  ========================================================= */

  const cameraStyle =
    mode === "full"
      ? {

          position: "fixed",

          top: 0,
          left: 0,

          width: "100vw",
          height: "100vh",

          zIndex: 100000,

          background: "#000",

          borderRadius: 0,

          overflow: "hidden",

          pointerEvents: "auto",

          userSelect: "none",

          touchAction: "none",

          cursor: "default"

        }
      : {

          position: "fixed",

          top: position.y,
          left: position.x,

          width: size.width,
          height: size.height,

          zIndex: 100000,

          background: "#000",

          borderRadius: "14px",

          overflow: "hidden",

          border: "2px solid gold",

          boxShadow:
            "0 8px 35px rgba(0,0,0,.7)",

          pointerEvents: "auto",

          userSelect: "none",

          touchAction: "none",

          cursor:
            resizing
              ? "nwse-resize"
              : dragging
                ? "grabbing"
                : "grab"

        }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div

      ref={cameraRef}

      className="teacherCameraFloating"

      style={cameraStyle}

      onPointerDown={handlePointerDown}

      onPointerMove={handlePointerMove}

      onPointerUp={handlePointerUp}

      onPointerCancel={handlePointerCancel}

      onDoubleClick={handleDoubleClick}

    >

      {/* =====================================================
          VIDEO
      ===================================================== */}

      <div

        ref={videoRef}

        className="teacherVideo"

        style={{

          position: "absolute",

          inset: 0,

          width: "100%",

          height: "100%",

          pointerEvents: "none",

          userSelect: "none"

        }}

      />


      {/* =====================================================
          NO CAMERA
      ===================================================== */}

      {!track && (

        <div

          className="noCamera"

          style={{

            position: "absolute",

            inset: 0,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            flexDirection: "column",

            gap: "8px",

            background:
              "linear-gradient(135deg,#151515,#050505)",

            color: "#fff",

            pointerEvents: "none",

            userSelect: "none"

          }}

        >

          <div
            style={{
              fontSize: "40px"
            }}
          >
            🎥
          </div>

          <div>
            No Camera
          </div>

        </div>

      )}


      {/* =====================================================
          CONTROL BAR
      ===================================================== */}

      {mode !== "full" && (

        <div

          className="cameraControl"

          onPointerDown={(e) =>
            e.stopPropagation()
          }

          style={{

            position: "absolute",

            left: 0,
            right: 0,
            bottom: 0,

            height: "40px",

            display: "flex",

            alignItems: "center",
            justifyContent: "center",

            gap: "5px",

            background:
              "linear-gradient(transparent,rgba(0,0,0,.9))",

            paddingTop: "6px",

            zIndex: 5,

            pointerEvents: "auto"

          }}

        >

          <button
            className="cameraControl"
            onPointerDown={(e) =>
              e.stopPropagation()
            }
            onClick={setSmall}
            style={buttonStyle}
            title="Small"
          >
            ▫
          </button>


          <button
            className="cameraControl"
            onPointerDown={(e) =>
              e.stopPropagation()
            }
            onClick={setMedium}
            style={buttonStyle}
            title="Medium"
          >
            ◻
          </button>


          <button
            className="cameraControl"
            onPointerDown={(e) =>
              e.stopPropagation()
            }
            onClick={setLarge}
            style={buttonStyle}
            title="Large"
          >
            ◼
          </button>


          <button
            className="cameraControl"
            onPointerDown={(e) =>
              e.stopPropagation()
            }
            onClick={setFull}
            style={buttonStyle}
            title="Full Screen"
          >
            ⛶
          </button>

        </div>

      )}


      {/* =====================================================
          FULL SCREEN EXIT
      ===================================================== */}

      {mode === "full" && (

        <button

          className="cameraControl"

          onPointerDown={(e) =>
            e.stopPropagation()
          }

          onClick={exitFull}

          style={{

            position: "absolute",

            top: "20px",
            right: "20px",

            width: "44px",
            height: "44px",

            borderRadius: "50%",

            border: "2px solid gold",

            background:
              "rgba(0,0,0,.8)",

            color: "gold",

            fontSize: "20px",

            fontWeight: "bold",

            cursor: "pointer",

            zIndex: 20,

            pointerEvents: "auto"

          }}

        >
          ✕
        </button>

      )}


      {/* =====================================================
          RESIZE HANDLE
      ===================================================== */}

      {mode !== "full" && (

        <div

          className="resizeHandle"

          onPointerDown={
            handleResizePointerDown
          }

          onPointerMove={
            handleResizePointerMove
          }

          onPointerUp={
            handleResizePointerUp
          }

          onPointerCancel={
            handleResizePointerUp
          }

          style={{

            position: "absolute",

            right: "2px",
            bottom: "2px",

            width: "24px",
            height: "24px",

            zIndex: 30,

            cursor:
              "nwse-resize",

            background:
              "linear-gradient(135deg,transparent 50%,gold 51%)",

            borderBottomRightRadius:
              "11px",

            pointerEvents: "auto",

            touchAction: "none"

          }}

        />

      )}

    </div>

  )

}


/* =========================================================
   BUTTON STYLE
========================================================= */

const buttonStyle = {

  width: "30px",

  height: "28px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  padding: 0,

  background:
    "rgba(0,0,0,.85)",

  color: "gold",

  border: "1px solid gold",

  borderRadius: "5px",

  cursor: "pointer",

  fontWeight: "bold",

  fontSize: "14px",

  pointerEvents: "auto",

  userSelect: "none"

}