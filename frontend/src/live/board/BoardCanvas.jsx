import {
  useEffect,
  useRef
} from "react"


export default function BoardCanvas({

  tool,

  color,

  brushSize,

  undoRef,

  redoRef,

  clearRef

}) {

  const canvasRef =
    useRef(null)

  const tempCanvasRef =
    useRef(null)


  const drawing =
    useRef(false)


  const startX =
    useRef(0)

  const startY =
    useRef(0)


  const history =
    useRef([])

  const redoStack =
    useRef([])


  const toolRef =
    useRef(tool)

  const colorRef =
    useRef(color)

  const sizeRef =
    useRef(brushSize)


  /* =====================================================
     SETTINGS
  ===================================================== */

  useEffect(() => {
    toolRef.current = tool
  }, [tool])


  useEffect(() => {
    colorRef.current = color
  }, [color])


  useEffect(() => {
    sizeRef.current = brushSize
  }, [brushSize])


  /* =====================================================
     CANVAS
  ===================================================== */

  useEffect(() => {

    const canvas =
      canvasRef.current

    const tempCanvas =
      tempCanvasRef.current


    if (
      !canvas ||
      !tempCanvas
    ) {
      return
    }


    const ctx =
      canvas.getContext("2d")

    const tempCtx =
      tempCanvas.getContext("2d")


    ctx.lineCap =
      "round"

    ctx.lineJoin =
      "round"


    tempCtx.lineCap =
      "round"

    tempCtx.lineJoin =
      "round"


    /* ===================================================
       BOARD CONTENT
    =================================================== */

    function getContent() {

      return canvas.closest(
        ".boardContent"
      )

    }


    /* ===================================================
       RESIZE
    =================================================== */

    function resize() {

      const content =
        getContent()

      if (!content) return


      const rect =
        content.getBoundingClientRect()


      /*
         نفس حجم مساحة المحتوى
      */

      const width =
        Math.max(
          1,
          Math.round(
            rect.width
          )
        )


      const height =
        Math.max(
          1,
          Math.round(
            rect.height
          )
        )


      /*
         لا نعيد ضبط Canvas
         إذا لم يتغير الحجم
      */

      if (
        canvas.width === width &&
        canvas.height === height
      ) {
        return
      }


      /*
         حفظ الرسم الحالي
      */

      let oldImage = null


      if (
        canvas.width > 0 &&
        canvas.height > 0
      ) {

        oldImage =
          canvas.toDataURL()

      }


      canvas.width =
        width

      canvas.height =
        height


      tempCanvas.width =
        width

      tempCanvas.height =
        height


      ctx.lineCap =
        "round"

      ctx.lineJoin =
        "round"


      tempCtx.lineCap =
        "round"

      tempCtx.lineJoin =
        "round"


      /*
         إعادة الرسم
      */

      if (oldImage) {

        const img =
          new Image()


        img.onload = () => {

          ctx.drawImage(
            img,
            0,
            0
          )

        }


        img.src =
          oldImage
      }

    }


    resize()


    const observer =
      new ResizeObserver(
        resize
      )


    const content =
      getContent()


    if (content) {
      observer.observe(
        content
      )
    }


    window.addEventListener(
      "resize",
      resize
    )


    /* ===================================================
       POSITION
    =================================================== */

    function getPos(e) {

      const rect =
        tempCanvas.getBoundingClientRect()


      return {

        x:
          e.clientX -
          rect.left,

        y:
          e.clientY -
          rect.top

      }

    }


    /* ===================================================
       SAVE
    =================================================== */

    function save() {

      history.current.push(
        canvas.toDataURL()
      )

      redoStack.current = []

    }


    /* ===================================================
       START
    =================================================== */

    function start(e) {

      if (
        e.button !== 0
      ) {
        return
      }


      drawing.current =
        true


      const pos =
        getPos(e)


      startX.current =
        pos.x

      startY.current =
        pos.y


      const currentTool =
        toolRef.current


      if (

        currentTool === "pen" ||

        currentTool === "marker" ||

        currentTool === "eraser"

      ) {

        ctx.beginPath()

        ctx.moveTo(
          pos.x,
          pos.y
        )

      }


      try {

        tempCanvas.setPointerCapture(
          e.pointerId
        )

      } catch {}

    }


    /* ===================================================
       MOVE
    =================================================== */

    function move(e) {

      if (
        !drawing.current
      ) {
        return
      }


      const pos =
        getPos(e)


      const currentTool =
        toolRef.current


      const currentColor =
        colorRef.current


      const size =
        sizeRef.current


      /* =================================================
         PEN
      ================================================= */

      if (
        currentTool === "pen"
      ) {

        ctx.globalCompositeOperation =
          "source-over"

        ctx.globalAlpha =
          1

        ctx.strokeStyle =
          currentColor

        ctx.lineWidth =
          size


        ctx.lineTo(
          pos.x,
          pos.y
        )

        ctx.stroke()

      }


      /* =================================================
         MARKER
      ================================================= */

      else if (
        currentTool === "marker"
      ) {

        ctx.globalCompositeOperation =
          "source-over"

        ctx.globalAlpha =
          0.25

        ctx.strokeStyle =
          currentColor

        ctx.lineWidth =
          size * 6


        ctx.lineTo(
          pos.x,
          pos.y
        )

        ctx.stroke()


        ctx.globalAlpha =
          1

      }


      /* =================================================
         ERASER
      ================================================= */

      else if (
        currentTool === "eraser"
      ) {

        ctx.globalCompositeOperation =
          "destination-out"

        ctx.globalAlpha =
          1

        ctx.lineWidth =
          size * 2


        ctx.lineTo(
          pos.x,
          pos.y
        )

        ctx.stroke()

      }


      /* =================================================
         SHAPES
      ================================================= */

      else {

        tempCtx.clearRect(

          0,

          0,

          tempCanvas.width,

          tempCanvas.height

        )


        tempCtx.globalCompositeOperation =
          "source-over"

        tempCtx.globalAlpha =
          1

        tempCtx.strokeStyle =
          currentColor

        tempCtx.lineWidth =
          size


        /* LINE */

        if (
          currentTool === "line"
        ) {

          tempCtx.beginPath()

          tempCtx.moveTo(

            startX.current,

            startY.current

          )


          tempCtx.lineTo(

            pos.x,

            pos.y

          )


          tempCtx.stroke()

        }


        /* RECT */

        else if (
          currentTool === "rect"
        ) {

          tempCtx.strokeRect(

            startX.current,

            startY.current,

            pos.x -
              startX.current,

            pos.y -
              startY.current

          )

        }


        /* CIRCLE */

        else if (
          currentTool === "circle"
        ) {

          const radius =
            Math.sqrt(

              Math.pow(
                pos.x -
                startX.current,
                2
              )

              +

              Math.pow(
                pos.y -
                startY.current,
                2
              )

            )


          tempCtx.beginPath()

          tempCtx.arc(

            startX.current,

            startY.current,

            radius,

            0,

            Math.PI * 2

          )


          tempCtx.stroke()

        }

      }

    }


    /* ===================================================
       END
    =================================================== */

    function end(e) {

      if (
        !drawing.current
      ) {
        return
      }


      drawing.current =
        false


      const currentTool =
        toolRef.current


      if (

        currentTool === "line" ||

        currentTool === "rect" ||

        currentTool === "circle"

      ) {

        ctx.drawImage(

          tempCanvas,

          0,

          0

        )


        tempCtx.clearRect(

          0,

          0,

          tempCanvas.width,

          tempCanvas.height

        )

      }


      ctx.globalCompositeOperation =
        "source-over"

      ctx.globalAlpha =
        1


      try {

        tempCanvas.releasePointerCapture(
          e.pointerId
        )

      } catch {}


      ctx.closePath()


      save()

    }


    /* ===================================================
       WHEEL
       
       مهم:
       لا نحرك الـCanvas.
       الـboardStage هو الذي يقوم بالـScroll.
    =================================================== */

    function handleWheel(e) {

      const stage =
        canvas.closest(
          ".boardStage"
        )


      if (!stage) {
        return
      }


      /*
         إذا لم نرسم الآن،
         نسمح للـStage بالـScroll
      */

      if (
        !drawing.current
      ) {

        stage.scrollTop +=
          e.deltaY

        stage.scrollLeft +=
          e.deltaX

        e.preventDefault()

      }

    }


    /* ===================================================
       EVENTS
    =================================================== */

    tempCanvas.addEventListener(
      "pointerdown",
      start
    )

    tempCanvas.addEventListener(
      "pointermove",
      move
    )

    tempCanvas.addEventListener(
      "pointerup",
      end
    )

    tempCanvas.addEventListener(
      "pointercancel",
      end
    )

    tempCanvas.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false
      }
    )


    /* ===================================================
       CLEANUP
    =================================================== */

    return () => {

      tempCanvas.removeEventListener(
        "pointerdown",
        start
      )

      tempCanvas.removeEventListener(
        "pointermove",
        move
      )

      tempCanvas.removeEventListener(
        "pointerup",
        end
      )

      tempCanvas.removeEventListener(
        "pointercancel",
        end
      )

      tempCanvas.removeEventListener(
        "wheel",
        handleWheel
      )


      observer.disconnect()


      window.removeEventListener(
        "resize",
        resize
      )

    }

  }, [])


  /* =====================================================
     UNDO
  ===================================================== */

  useEffect(() => {

    undoRef.current = () => {

      if (
        history.current.length === 0
      ) {
        return
      }


      const canvas =
        canvasRef.current

      const ctx =
        canvas.getContext("2d")


      const removed =
        history.current.pop()


      redoStack.current.push(
        removed
      )


      ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

      )


      if (
        history.current.length === 0
      ) {
        return
      }


      const img =
        new Image()


      img.onload = () => {

        ctx.drawImage(
          img,
          0,
          0
        )

      }


      img.src =
        history.current[
          history.current.length - 1
        ]

    }

  }, [])


  /* =====================================================
     REDO
  ===================================================== */

  useEffect(() => {

    redoRef.current = () => {

      if (
        redoStack.current.length === 0
      ) {
        return
      }


      const canvas =
        canvasRef.current

      const ctx =
        canvas.getContext("2d")


      const state =
        redoStack.current.pop()


      history.current.push(
        state
      )


      const img =
        new Image()


      img.onload = () => {

        ctx.clearRect(

          0,

          0,

          canvas.width,

          canvas.height

        )


        ctx.drawImage(
          img,
          0,
          0
        )

      }


      img.src =
        state

    }

  }, [])


  /* =====================================================
     CLEAR
  ===================================================== */

  useEffect(() => {

    clearRef.current = () => {

      const canvas =
        canvasRef.current

      const ctx =
        canvas.getContext("2d")


      ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

      )


      history.current = []

      redoStack.current = []

    }

  }, [])


  return (

    <>

      <canvas
        ref={canvasRef}
        className="boardCanvas"
      />

      <canvas
        ref={tempCanvasRef}
        className="tempCanvas"
      />

    </>

  )
}