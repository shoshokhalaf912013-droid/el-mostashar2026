import { useEffect, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import pdfWorker from "pdfjs-dist/build/pdf.worker?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function PDFEditor({ file }) {

const pdfCanvasRef = useRef(null)
const drawCanvasRef = useRef(null)

const [pdf,setPdf] = useState(null)
const [page,setPage] = useState(1)
const [totalPages,setTotalPages] = useState(0)

/* ================= LOAD PDF ================= */

useEffect(()=>{

if(!file) return

async function loadPDF(){

try{

const buffer = await file.arrayBuffer()

const loadingTask = pdfjsLib.getDocument({ data:buffer })

const pdfDoc = await loadingTask.promise

setPdf(pdfDoc)
setTotalPages(pdfDoc.numPages)

renderPage(pdfDoc,1)

}catch(e){

console.error("PDF LOAD ERROR",e)

}

}

loadPDF()

},[file])

/* ================= RENDER PAGE ================= */

async function renderPage(pdfDoc,pageNumber){

if(!pdfDoc) return

const page = await pdfDoc.getPage(pageNumber)

const canvas = pdfCanvasRef.current
const context = canvas.getContext("2d")

const viewport = page.getViewport({ scale:1.6 })

canvas.width = viewport.width
canvas.height = viewport.height

await page.render({
canvasContext:context,
viewport:viewport
}).promise

/* مزامنة كانفاس الرسم */

const drawCanvas = drawCanvasRef.current
drawCanvas.width = canvas.width
drawCanvas.height = canvas.height

}

/* ================= NAVIGATION ================= */

function nextPage(){

if(page >= totalPages) return

const newPage = page + 1

setPage(newPage)

renderPage(pdf,newPage)

}

function prevPage(){

if(page <= 1) return

const newPage = page - 1

setPage(newPage)

renderPage(pdf,newPage)

}

/* ================= UI ================= */

return(

<div className="pdf-editor">

<div className="pdf-toolbar">

<button onClick={prevPage}>◀</button>

<span>{page} / {totalPages}</span>

<button onClick={nextPage}>▶</button>

</div>

<div className="pdf-viewer">

<canvas
ref={pdfCanvasRef}
className="pdf-canvas"
/>

<canvas
ref={drawCanvasRef}
className="draw-canvas"
/>

</div>

</div>

)

}

