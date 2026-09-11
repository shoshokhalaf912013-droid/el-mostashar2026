import { motion } from "framer-motion";
import { useState } from "react";

export default function GoldenName({ name }) {
  const letters = name.split("");
  const [completed, setCompleted] = useState(false);

  return (
    <div className="relative">
      <h2 className="flex justify-center flex-wrap text-3xl font-extrabold">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
            }}
            onAnimationComplete={() => {
              if (index === letters.length - 1) {
                setCompleted(true);
              }
            }}
            className="
            mx-[2px]
            bg-gradient-to-r
            from-yellow-200 via-yellow-400 to-yellow-600
            bg-clip-text text-transparent
            drop-shadow-[0_0_10px_gold]"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </h2>

      {/* GOLD BURST */}
      {completed && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex justify-center items-center text-6xl"
        >
          ✨
        </motion.div>
      )}
    </div>
  );
}