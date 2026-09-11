import { useEffect, useState, useRef } from "react";

/* =====================================
   ✨ حرف يظهر + تطاير ذهبى
===================================== */
function GoldenLetter({ letter, delay }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span className="relative inline-block mx-[2px]">
      {/* الحرف */}
      <span
        className={`transition-all duration-500 ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
        style={{
          color: "gold",
          fontWeight: "bold",
          fontSize: "28px",
          textShadow: "0 0 10px gold,0 0 20px gold",
        }}
      >
        {letter}
      </span>

      {/* شرارة ذهبية */}
      {show && <span className="gold-spark" />}
    </span>
  );
}

/* =====================================
   👑 كتابة الاسم حرف حرف
===================================== */
function GoldenName({ name }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {name.split("").map((l, i) => (
        <GoldenLetter key={i} letter={l} delay={i * 250} />
      ))}
    </div>
  );
}

/* =====================================
   🌊 النافورة الذهبية (Particles)
===================================== */
function GoldenFountain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = 400;

    let particles = [];

    function createParticle() {
      particles.push({
        x: canvas.width / 2,
        y: 350,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 6 - 4,
        life: 100,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      createParticle();

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
        ctx.fill();

        if (p.life <= 0) particles.splice(i, 1);
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* =====================================
   🎤 تفاعل مع الصوت
===================================== */
function useSoundReactive() {
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const mic = audioCtx.createMediaStreamSource(stream);

      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      function react() {
        analyser.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b) / data.length;

        document.documentElement.style.setProperty(
          "--gold-glow",
          `${20 + volume / 3}px`
        );

        requestAnimationFrame(react);
      }

      react();
    });
  }, []);
}

/* =====================================
   👑 المكون النهائى
===================================== */
export default function GoldenCelebration({ name }) {
  useSoundReactive();

  return (
    <div style={{ position: "relative", marginTop: "40px" }}>
      <GoldenFountain />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
        }}
      >
        <GoldenName name={name} />
      </div>
    </div>
  );
}