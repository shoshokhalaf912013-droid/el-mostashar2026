import { useEffect, useState } from "react";

/*
  طبقة سينمائية لا تؤثر على الصفحة
  Overlay فقط
*/

export default function CinematicCelebration({ name }) {

  const [index, setIndex] = useState(-1);
  const [sparks, setSparks] = useState([]);

  const letter =
    index >= 0 ? name[index] : "";

  /* ===== بدء العرض ===== */
  useEffect(() => {
    if (!name) return;

    const start = setTimeout(() => {
      setIndex(0);
    }, 1500);

    return () => clearTimeout(start);
  }, [name]);

  /* ===== حركة الحروف ===== */
  useEffect(() => {
    if (index < 0 || index >= name.length) return;

    const timer = setTimeout(() => {

      const newSparks = Array.from({ length: 12 }).map(
        (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 140 - 70,
          y: Math.random() * 140 - 70,
        })
      );

      setSparks(newSparks);

      setIndex((i) => i + 1);

    }, 1400);

    return () => clearTimeout(timer);
  }, [index, name]);

  /* ===== الصوت ===== */
  useEffect(() => {
    if (!name) return;

    const audio = new Audio("/sounds/preview.mp3");
    audio.volume = 0.6;
    audio.play().catch(()=>{});

  }, [name]);

  if (!name) return null;

  return (
    <div className="name-orb">

      <div className="orb-circle">

        <span className="orb-letter gold-text">
          {letter}
        </span>

        {sparks.map((s) => (
          <span
            key={s.id}
            className="gold-spark"
            style={{
              left: `calc(50% + ${s.x}px)`,
              top: `calc(50% + ${s.y}px)`
            }}
          />
        ))}

      </div>

      <div className="gold-fountain" />
    </div>
  );
}