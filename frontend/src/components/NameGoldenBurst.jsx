import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  ⭐ تناثر ذهبى يخرج من الاسم
  يظهر مرة عند active = true
*/

export default function NameGoldenBurst({ active }) {

  const [particles, setParticles] = useState([]);

  useEffect(() => {

    if (!active) return;

    // توليد 40 ذرة ذهبية
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 160,
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.4
    }));

    setParticles(newParticles);

    // تختفى بعد 3 ثوانى
    const timer = setTimeout(() => {
      setParticles([]);
    }, 3000);

    return () => clearTimeout(timer);

  }, [active]);

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible"
      style={{ zIndex: 20 }}
    >
      <AnimatePresence>
        {particles.map((p) => (

          <motion.span
            key={p.id}
            initial={{
              opacity: 1,
              scale: 0,
              x: 0,
              y: 0
            }}
            animate={{
              opacity: 0,
              scale: 1.2,
              x: p.x,
              y: p.y,
              rotate: p.rotate
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              delay: p.delay,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #FFD700, #ffb300)",
              boxShadow:
                "0 0 10px #FFD700, 0 0 20px #FFD700"
            }}
          />

        ))}
      </AnimatePresence>
    </div>
  );
}