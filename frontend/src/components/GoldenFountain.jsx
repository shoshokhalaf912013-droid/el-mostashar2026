import { useEffect, useRef } from "react";

export default function GoldenFountain({ active }) {

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {

    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // ===============================
    // إعداد الأعمدة (الفوهات)
    // ===============================
    const columns = 40;
    const spacing = () => canvas.width / columns;

    let time = 0;

    function draw() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.05;

      for (let i = 0; i < columns; i++) {

        const x = canvas.width - i * spacing();

        // تأخير لكل عمود (سر الحركة الأفقية)
        const phase = i * 0.35;

        // ارتفاع الموجة
        const wave =
          Math.sin(time - phase) * 0.5 + 0.5;

        const height = wave * canvas.height * 0.8;

        const baseY = canvas.height;

        // رسم العمود كجزيئات ذهبية
        const particlesPerColumn = 6;

        for (let j = 0; j < particlesPerColumn; j++) {

          const y =
            baseY - (height * j) / particlesPerColumn;

          const size = 2 + Math.random() * 1.5;

          ctx.beginPath();
          ctx.arc(
            x + (Math.random() - 0.5) * 6,
            y,
            size,
            0,
            Math.PI * 2
          );

          ctx.fillStyle = "rgba(255,215,0,0.9)";
          ctx.shadowBlur = 18;
          ctx.shadowColor = "#FFD700";
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };

  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}