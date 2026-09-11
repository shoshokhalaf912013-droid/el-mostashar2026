import { useEffect, useRef } from "react"


export default function PdfDrawingOverlay({
  tool,
  color,
  brushSize,
  undoRef,
  redoRef,
  clearRef
}) {

  const captureRef =
    useRef(null)

  const toolRef =
    useRef(tool)

  const colorRef =
    useRef(color)

  const sizeRef =
    useRef(brushSize)

  const pagesRef =
    useRef(new Map())

  const drawingRef =
    useRef(false)

  const activePageRef =
    useRef(null)

  const startXRef =
    useRef(0)

  const startYRef =
    useRef(0)

  const beforeImageRef =
    useRef(null)

  const historyRef =
    useRef([])

  const redoStackRef =
    useRef([])


  useEffect(() => {
    toolRef.current = tool
  }, [tool])


  useEffect(() => {
    colorRef.current = color
  }, [color])


  useEffect(() => {
    sizeRef.current = brushSize
  }, [brushSize])


  useEffect(() => {

    const capture =
      captureRef.current

    if (!capture) return

    const boardContent =
      capture.closest(
        ".boardContent"
      )

    const pageMap =
      pagesRef.current


    function createPageCanvases(page) {

      if (pageMap.has(page)) {
        return pageMap.get(page)
      }

      const width =
        Math.max(
          1,
          Math.round(
            page.clientWidth ||
            parseFloat(page.style.width) ||
            page.getBoundingClientRect().width
          )
        )

      const height =
        Math.max(
          1,
          Math.round(
            page.clientHeight ||
            parseFloat(page.style.height) ||
            page.getBoundingClientRect().height
          )
        )


      const canvas =
        document.createElement("canvas")

      const tempCanvas =
        document.createElement("canvas")


      const ctx =
        canvas.getContext("2d")

      const tempCtx =
        tempCanvas.getContext("2d")


      if (!ctx || !tempCtx) {
        return null
      }


      canvas.width = width
      canvas.height = height

      tempCanvas.width = width
      tempCanvas.height = height


      canvas.style.position =
        "absolute"

      canvas.style.inset =
        "0"

      canvas.style.width =
        "100%"

      canvas.style.height =
        "100%"

      canvas.style.display =
        "block"

      canvas.style.pointerEvents =
        "none"

      canvas.style.userSelect =
        "none"

      canvas.style.zIndex =
        "5"

      canvas.style.touchAction =
        "none"


      tempCanvas.style.position =
        "absolute"

      tempCanvas.style.inset =
        "0"

      tempCanvas.style.width =
        "100%"

      tempCanvas.style.height =
        "100%"

      tempCanvas.style.display =
        "block"

      tempCanvas.style.pointerEvents =
        "none"

      tempCanvas.style.userSelect =
        "none"

      tempCanvas.style.zIndex =
        "6"

      tempCanvas.style.touchAction =
        "none"


      ctx.lineCap =
        "round"

      ctx.lineJoin =
        "round"

      tempCtx.lineCap =
        "round"

      tempCtx.lineJoin =
        "round"


      page.appendChild(canvas)
      page.appendChild(tempCanvas)


      const state = {
        page,
        pageNumber:
          Number(
            page.dataset.pageNumber ||
            pageMap.size + 1
          ),
        canvas,
        tempCanvas,
        ctx,
        tempCtx
      }


      pageMap.set(
        page,
        state
      )

      return state
    }


    function refreshPages() {

      if (!boardContent) {
        return
      }

      const pageElements =
        boardContent.querySelectorAll(
          ".pdf-page"
        )

      pageElements.forEach(page => {
        createPageCanvases(page)
      })
    }


    function getCaptureMetrics() {

      const rect =
        capture.getBoundingClientRect()

      const unscaledWidth =
        Math.max(
          1,
          capture.offsetWidth
        )

      const unscaledHeight =
        Math.max(
          1,
          capture.offsetHeight
        )

      const scaleX =
        rect.width /
        unscaledWidth

      const scaleY =
        rect.height /
        unscaledHeight

      return {
        rect,
        scaleX:
          Number.isFinite(scaleX) &&
          scaleX > 0
            ? scaleX
            : 1,
        scaleY:
          Number.isFinite(scaleY) &&
          scaleY > 0
            ? scaleY
            : 1
      }
    }


    function findPage(clientX, clientY) {

      const {
        rect,
        scaleX,
        scaleY
      } = getCaptureMetrics()


      const localX =
        (clientX - rect.left) /
        scaleX

      const localY =
        (clientY - rect.top) /
        scaleY


      for (const state of pageMap.values()) {

        const pageRect =
          state.page.getBoundingClientRect()

        const pageLeft =
          (pageRect.left - rect.left) /
          scaleX

        const pageTop =
          (pageRect.top - rect.top) /
          scaleY

        const pageWidth =
          pageRect.width /
          scaleX

        const pageHeight =
          pageRect.height /
          scaleY

        if (
          localX >= pageLeft &&
          localX <= pageLeft + pageWidth &&
          localY >= pageTop &&
          localY <= pageTop + pageHeight
        ) {
          return {
            state,
            pageLeft,
            pageTop,
            pageWidth,
            pageHeight
          }
        }
      }

      return null
    }


    function getPagePosition(
      state,
      clientX,
      clientY
    ) {

      const {
        rect,
        scaleX,
        scaleY
      } = getCaptureMetrics()


      const pageRect =
        state.page.getBoundingClientRect()


      return {
        x:
          (clientX - pageRect.left) /
          Math.max(0.0001, scaleX),
        y:
          (clientY - pageRect.top) /
          Math.max(0.0001, scaleY),
        rect
      }
    }


    function saveAction(
      state,
      before,
      after
    ) {

      if (!before || !after) {
        return
      }

      historyRef.current.push({
        page: state,
        before,
        after
      })

      redoStackRef.current = []
    }


    function restoreImage(
      state,
      dataUrl
    ) {

      const {
        canvas,
        ctx
      } = state

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      )

      if (!dataUrl) {
        return
      }

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
          0,
          canvas.width,
          canvas.height
        )
      }

      img.src = dataUrl
    }


    function drawShape(
      state,
      currentX,
      currentY
    ) {

      const {
        tempCtx,
        tempCanvas
      } = state

      const currentTool =
        toolRef.current

      const currentColor =
        colorRef.current

      const size =
        sizeRef.current


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


      if (
        currentTool === "line"
      ) {

        tempCtx.beginPath()

        tempCtx.moveTo(
          startXRef.current,
          startYRef.current
        )

        tempCtx.lineTo(
          currentX,
          currentY
        )

        tempCtx.stroke()

      }

      else if (
        currentTool === "rect"
      ) {

        tempCtx.strokeRect(
          startXRef.current,
          startYRef.current,
          currentX -
            startXRef.current,
          currentY -
            startYRef.current
        )

      }

      else if (
        currentTool === "circle"
      ) {

        const radius =
          Math.sqrt(
            Math.pow(
              currentX -
                startXRef.current,
              2
            ) +
            Math.pow(
              currentY -
                startYRef.current,
              2
            )
          )

        tempCtx.beginPath()

        tempCtx.arc(
          startXRef.current,
          startYRef.current,
          radius,
          0,
          Math.PI * 2
        )

        tempCtx.stroke()
      }
    }


    function start(e) {

      if (e.button !== 0) {
        return
      }

      refreshPages()

      const found =
        findPage(
          e.clientX,
          e.clientY
        )

      if (!found) {
        return
      }

      const state =
        found.state

      const pos =
        getPagePosition(
          state,
          e.clientX,
          e.clientY
        )

      drawingRef.current =
        true

      activePageRef.current =
        state

      beforeImageRef.current =
        state.canvas.toDataURL("image/png")

      startXRef.current =
        pos.x

      startYRef.current =
        pos.y


      const currentTool =
        toolRef.current


      if (
        currentTool === "pen" ||
        currentTool === "marker" ||
        currentTool === "eraser"
      ) {

        const {
          ctx
        } = state

        if (
          currentTool === "pen"
        ) {
          ctx.globalCompositeOperation =
            "source-over"
          ctx.globalAlpha =
            1
          ctx.strokeStyle =
            colorRef.current
          ctx.lineWidth =
            sizeRef.current
        }

        else if (
          currentTool === "marker"
        ) {
          ctx.globalCompositeOperation =
            "source-over"
          ctx.globalAlpha =
            0.25
          ctx.strokeStyle =
            colorRef.current
          ctx.lineWidth =
            sizeRef.current * 6
        }

        else {
          ctx.globalCompositeOperation =
            "destination-out"
          ctx.globalAlpha =
            1
          ctx.lineWidth =
            sizeRef.current * 2
        }

        ctx.beginPath()

        ctx.moveTo(
          pos.x,
          pos.y
        )
      }


      try {
        capture.setPointerCapture(
          e.pointerId
        )
      } catch {}

      e.preventDefault()
    }


    function move(e) {

      if (
        !drawingRef.current
      ) {
        return
      }

      const state =
        activePageRef.current

      if (!state) {
        return
      }

      const pos =
        getPagePosition(
          state,
          e.clientX,
          e.clientY
        )

      const currentTool =
        toolRef.current


      if (
        currentTool === "pen" ||
        currentTool === "marker" ||
        currentTool === "eraser"
      ) {

        state.ctx.lineTo(
          pos.x,
          pos.y
        )

        state.ctx.stroke()

      }

      else {
        drawShape(
          state,
          pos.x,
          pos.y
        )
      }

      e.preventDefault()
    }


    function end(e) {

      if (
        !drawingRef.current
      ) {
        return
      }

      const state =
        activePageRef.current

      if (!state) {
        drawingRef.current =
          false
        return
      }

      const currentTool =
        toolRef.current


      if (
        currentTool === "line" ||
        currentTool === "rect" ||
        currentTool === "circle"
      ) {

        state.ctx.globalCompositeOperation =
          "source-over"

        state.ctx.globalAlpha =
          1

        state.ctx.drawImage(
          state.tempCanvas,
          0,
          0
        )

        state.tempCtx.clearRect(
          0,
          0,
          state.tempCanvas.width,
          state.tempCanvas.height
        )
      }


      state.ctx.globalCompositeOperation =
        "source-over"

      state.ctx.globalAlpha =
        1


      const before =
        beforeImageRef.current

      const after =
        state.canvas.toDataURL("image/png")


      saveAction(
        state,
        before,
        after
      )


      try {
        capture.releasePointerCapture(
          e.pointerId
        )
      } catch {}


      drawingRef.current =
        false

      activePageRef.current =
        null

      beforeImageRef.current =
        null

      e.preventDefault()
    }


    function handleWheel(e) {

      const stage =
        capture.closest(
          ".boardStage"
        )

      if (!stage) {
        return
      }

      if (
        !drawingRef.current
      ) {

        stage.scrollTop +=
          e.deltaY

        stage.scrollLeft +=
          e.deltaX

      }

      e.preventDefault()
    }


    function handleResize() {
      refreshPages()
    }


    capture.addEventListener(
      "pointerdown",
      start
    )

    capture.addEventListener(
      "pointermove",
      move
    )

    capture.addEventListener(
      "pointerup",
      end
    )

    capture.addEventListener(
      "pointercancel",
      end
    )

    capture.addEventListener(
      "wheel",
      handleWheel,
      { passive: false }
    )

    window.addEventListener(
      "resize",
      handleResize
    )


    let mutationObserver =
      null

    if (
      boardContent &&
      typeof MutationObserver !==
        "undefined"
    ) {

      mutationObserver =
        new MutationObserver(() => {
          refreshPages()
        })

      mutationObserver.observe(
        boardContent,
        {
          childList: true,
          subtree: true
        }
      )
    }


    refreshPages()


    undoRef.current = () => {

      const action =
        historyRef.current.pop()

      if (!action) {
        return
      }

      redoStackRef.current.push(
        action
      )

      restoreImage(
        action.page,
        action.before
      )
    }


    redoRef.current = () => {

      const action =
        redoStackRef.current.pop()

      if (!action) {
        return
      }

      historyRef.current.push(
        action
      )

      restoreImage(
        action.page,
        action.after
      )
    }


    clearRef.current = () => {

      for (
        const state of pageMap.values()
      ) {

        state.ctx.clearRect(
          0,
          0,
          state.canvas.width,
          state.canvas.height
        )

        state.tempCtx.clearRect(
          0,
          0,
          state.tempCanvas.width,
          state.tempCanvas.height
        )
      }

      historyRef.current = []
      redoStackRef.current = []
    }


    return () => {

      capture.removeEventListener(
        "pointerdown",
        start
      )

      capture.removeEventListener(
        "pointermove",
        move
      )

      capture.removeEventListener(
        "pointerup",
        end
      )

      capture.removeEventListener(
        "pointercancel",
        end
      )

      capture.removeEventListener(
        "wheel",
        handleWheel
      )

      window.removeEventListener(
        "resize",
        handleResize
      )

      mutationObserver?.disconnect()


      for (
        const state of pageMap.values()
      ) {
        state.canvas.remove()
        state.tempCanvas.remove()
      }

      pageMap.clear()

      undoRef.current = null
      redoRef.current = null
      clearRef.current = null
    }

  }, [undoRef, redoRef, clearRef])


  return (

    <div
      ref={captureRef}
      className="pdfDrawingCapture"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 25,
        pointerEvents: "auto",
        background: "transparent",
        touchAction: "none"
      }}
    />
  )
}
