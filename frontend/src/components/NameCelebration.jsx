import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function NameCelebration({ name, active }) {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    if (!active || !name) return;

    setLetters(name.split(""));
  }, [name, active]);

  if (!active) return null;

  return (
    <div className="relative mt-6 text-center select-none">

      {/* الاسم حرف حرف */}
      <div className="flex justify-center flex-wrap gap-1 text-3xl md:text-4xl font-bold text-yellow-400">

        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative"
          >
            {letter}

            {/* شرارات ذهبية */}
            <span className="spark-container">
              {[...Array(4)].map((_, s) => (
                <span
                  key={s}
                  className="gold-spark"
                  style={{
                    animationDelay: `${Math.random() * 1.5}s`,
                  }}
                />
              ))}
            </span>
          </motion.span>
        ))}
      </div>

      {/* أفاتارات ذهبية */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="gold-avatar"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}