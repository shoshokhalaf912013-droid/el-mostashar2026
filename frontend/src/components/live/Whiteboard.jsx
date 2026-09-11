import { useEffect, useRef } from "react";
import { fabric } from "fabric";

export default function Whiteboard() {

  const canvasRef = useRef(null);

  useEffect(() => {

    const canvas = new fabric.Canvas(canvasRef.current);

    canvas.isDrawingMode = true;

    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "red";

  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border"
    />
  );
}