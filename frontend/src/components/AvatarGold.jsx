import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AvatarGold({ name = "" }) {

  const [displayedName, setDisplayedName] = useState("");

  /* كتابة الاسم حرف تلو الحرف */
  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (index < name.length) {
        setDisplayedName(name.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 120); // سرعة العداد

    return () => clearInterval(interval);
  }, [name]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 1 }}
      className="flex justify-center mb-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "linear",
        }}
        className="
        w-36 h-36 rounded-full
        flex items-center justify-center
        text-center
        text-black font-bold
        bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600
        shadow-[0_0_45px_gold]
        border-4 border-yellow-300
        p-4
        overflow-hidden
        "
      >
        <span className="text-sm leading-5 break-words">
          {displayedName}
          <span className="blink">|</span>
        </span>
      </motion.div>
    </motion.div>
  );
}