import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

const PDFViewer = ({url}) => {

const canvasRef = useRef()

useEffect(()=>{

const loadPDF = async ()=>{

const pdf = await pdfjsLib.getDocument(url).promise

const page = await pdf.getPage(1)

const viewport = page.getViewport({scale:1.5})

const canvas = canvasRef.current

const context = canvas.getContext("2d")

canvas.height = viewport.height
canvas.width = viewport.width

page.render({
canvasContext:context,
viewport:viewport
})

}

loadPDF()

},[url])

return(

<canvas ref={canvasRef}></canvas>

)

}

export default PDFViewer