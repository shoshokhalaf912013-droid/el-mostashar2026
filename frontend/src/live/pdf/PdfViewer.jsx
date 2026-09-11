import { useEffect, useRef } from "react"
import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc =
"//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

export default function PDFViewer({ file }) {

const pagesRef = useRef(null)

useEffect(()=>{

if(!file) return

loadPDF()

},[file])

async function loadPDF(){

const container = pagesRef.current

container.innerHTML=""

let pdfData

if(file instanceof File){
pdfData = await file.arrayBuffer()
}else{
pdfData = file
}

const pdf = await pdfjsLib.getDocument({data:pdfData}).promise

console.log("عدد الصفحات:",pdf.numPages)

/* رسم كل الصفحات */

for(let pageNumber=1; pageNumber<=pdf.numPages; pageNumber++){

const page = await pdf.getPage(pageNumber)

const viewport = page.getViewport({scale:1.5})

const canvas = document.createElement("canvas")

canvas.className="pdf-page"

const context = canvas.getContext("2d")

canvas.width = viewport.width
canvas.height = viewport.height

container.appendChild(canvas)

await page.render({
canvasContext:context,
viewport:viewport
}).promise

}

}

return(

<div className="pdf-viewer">

<div
className="pdf-pages"
ref={pagesRef}
/>

</div>

)

}