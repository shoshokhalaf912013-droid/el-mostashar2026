import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function PdfObject({ url }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.3);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#ff0000");

  useEffect(() => {
    const load = async () => {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      renderPage(pdfDoc, 1);
    };

    load();
  }, [url]);

  const renderPage = async (pdfDoc, num) => {
    const page = await pdfDoc.getPage(num);

    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext);
  };

  const startDraw = e => {
    if (tool !== "pen") return;
    setDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
  };

  const draw = e => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDraw = () => {
    setDrawing(false);
  };

  const nextPage = () => {
    if (!pdf) return;
    if (pageNum >= pdf.numPages) return;
    const num = pageNum + 1;
    setPageNum(num);
    renderPage(pdf, num);
  };

  const prevPage = () => {
    if (!pdf) return;
    if (pageNum <= 1) return;
    const num = pageNum - 1;
    setPageNum(num);
    renderPage(pdf, num);
  };

  const zoomIn = () => {
    const s = scale + 0.2;
    setScale(s);
    renderPage(pdf, pageNum);
  };

  const zoomOut = () => {
    const s = scale - 0.2;
    setScale(s);
    renderPage(pdf, pageNum);
  };

  const fullscreen = () => {
    const el = containerRef.current;
    if (el.requestFullscreen) el.requestFullscreen();
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        position: "relative",
        overflow: "auto"
      }}
      onDoubleClick={fullscreen}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "#fff",
          padding: 10,
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,.2)",
          zIndex: 100
        }}
      >
        <button onClick={prevPage}>Prev</button>
        <button onClick={nextPage}>Next</button>

        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>

        <button onClick={() => setTool("pen")}>Pen</button>

        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
        />
      </div>

      <canvas
        ref={canvasRef}
        style={{
          margin: "80px auto",
          display: "block",
          border: "1px solid #ccc"
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
      />
    </div>
  );
}