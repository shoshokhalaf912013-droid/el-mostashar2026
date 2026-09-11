// src/components/GlobalCelebrationLayer.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  طبقة احتفال عالمية
  تظهر فوق الموقع كله
*/

export default function GlobalCelebrationLayer({ studentName }) {

  const [show, setShow] = useState(false);

  useEffect(() => {

    // انتظار تحميل الصفحة بالكامل
    const timer = setTimeout(() => {
      setShow(true);
    }, 1200);

    // يختفى بعد مدة
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 6500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };

  }, []);

  /* ================= PARTICLES ================= */

  const particles = Array.from({ length: 26 });

  return (
    <AnimatePresence>

      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[9999] flex items-start justify-center pt-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >

          {/* ===== الاسم الذهبى ===== */}
          <motion.div
            className="relative text-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 drop-shadow-lg">
              ✨ أهلاً بك يا {studentName}
            </h2>

            {/* ===== تناثر الذهب ===== */}
            {particles.map((_, i) => (

              <motion.span
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1
                }}
                animate={{
                  x: (Math.random() - 0.5) * 420,
                  y: Math.random() * -260,
                  opacity: 0,
                  scale: 0
                }}
                transition={{
                  duration: 2.2,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                style={{
                  left: "50%",
                  top: "50%",
                }}
              />

            ))}

          </motion.div>

        </motion.div>
      )}

    </AnimatePresence>
  );
}