import { motion } from "framer-motion";

export default function BirthdayGlow({ active }) {

  if (!active) return null;

  const particles = Array.from({ length: 18 });
  const stars = Array.from({ length: 10 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* ⭐ تناثر ذهبى */}
      {particles.map((_, i) => (
        <motion.span
          key={"gold-" + i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{
            opacity: 0,
            y: 20,
            x: Math.random() * 200 - 100
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [-20, -80],
            scale: [0.5, 1.2, 0.3]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.15
          }}
          style={{ left: "50%", bottom: "0%" }}
        />
      ))}

      {/* ⭐ نجوم زرقاء */}
      {stars.map((_, i) => (
        <motion.span
          key={"star-" + i}
          className="absolute text-blue-400 text-lg"
          initial={{
            opacity: 0,
            y: 10,
            x: Math.random() * 220 - 110
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [-30, -90],
            rotate: [0, 180]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.25
          }}
          style={{ left: "50%", bottom: "10%" }}
        >
          ✦
        </motion.span>
      ))}

    </div>
  );
}