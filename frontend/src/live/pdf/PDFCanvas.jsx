import { useEffect, useRef, forwardRef } from "react"
import * as pdfjsLib from "pdfjs-dist"
import "pdfjs-dist/build/pdf.worker.entry"

const PDFCanvas = forwardRef(({ file, tool, color, page }, ref) => {

const pdfCanvas = useRef(null)
const drawCanvas = useRef(null)

const drawing = useRef(false)

/* ================= LOAD PDF ================= */

useEffect(() => {

loadPDF()

}, [file, page])

async function loadPDF(){

if(!file) return

let source = file

/* يدعم File object أو URL */

if(typeof file !== "string"){

source = URL.createObjectURL(file)

}

const pdf = await pdfjsLib.getDocument(source).promise

const p = await pdf.getPage(page || 1)

const viewport = p.getViewport({ scale:1.5 })

const canvas = pdfCanvas.current
const ctx = canvas.getContext("2d")

canvas.width = viewport.width
canvas.height = viewport.height

const draw = drawCanvas.current

draw.width = viewport.width
draw.height = viewport.height

await p.render({
canvasContext: ctx,
viewport
}).promise

}

/* ================= DRAW ================= */

useEffect(()=>{

const canvas = drawCanvas.current
const ctx = canvas.getContext("2d")

if(!canvas) return

ctx.strokeStyle = color || "#ffd700"
ctx.lineWidth = 3
ctx.lineCap = "round"

function startDraw(e){

drawing.current = true

ctx.beginPath()
ctx.moveTo(e.offsetX, e.offsetY)

}

function drawMove(e){

if(!drawing.current) return

ctx.lineTo(e.offsetX, e.offsetY)
ctx.stroke()

}

function endDraw(){

drawing.current = false

}

canvas.addEventListener("mousedown", startDraw)
canvas.addEventListener("mousemove", drawMove)
canvas.addEventListener("mouseup", endDraw)
canvas.addEventListener("mouseleave", endDraw)

return () => {

canvas.removeEventListener("mousedown", startDraw)
canvas.removeEventListener("mousemove", drawMove)
canvas.removeEventListener("mouseup", endDraw)
canvas.removeEventListener("mouseleave", endDraw)

}

}, [color, tool])

/* ================= UI ================= */

return (

<div className="pdf-container">

<canvas
ref={pdfCanvas}
/>

<canvas
ref={drawCanvas}
className="pdf-draw-layer"
/>

</div>

)

})

export default PDFCanvas