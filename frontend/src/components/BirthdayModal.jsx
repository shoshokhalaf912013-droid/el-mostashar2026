import { motion } from "framer-motion";
import { useEffect } from "react";
import GoldenName from "../components/GoldenName";
import AvatarGold from "../components/AvatarGold";

// 🔥 متغير عام خارج المكون
let birthdayAudio = null;

export default function BirthdayModal({ name, onClose }) {

  useEffect(() => {

    // 🛑 لو فيه صوت شغال بالفعل نوقفه
    if (birthdayAudio) {
      birthdayAudio.pause();
      birthdayAudio.currentTime = 0;
    }

    birthdayAudio = new Audio("/sounds/preview.mp3");
    birthdayAudio.volume = 0.5;
    birthdayAudio.play().catch(() => {});

    // ⏱️ إيقاف بعد 5 ثواني فقط
    const timer = setTimeout(() => {
      if (birthdayAudio) {
        birthdayAudio.pause();
        birthdayAudio.currentTime = 0;
      }
    }, 5000);

    // تنظيف عند الإغلاق
    return () => {
      clearTimeout(timer);
      if (birthdayAudio) {
        birthdayAudio.pause();
        birthdayAudio.currentTime = 0;
      }
    };

  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">

      {/* ✨ Gold Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-yellow-400 text-xl"
            initial={{
              top: "-10%",
              left: `${Math.random() * 100}%`,
              opacity: 0,
            }}
            animate={{
              top: "110%",
              opacity: 1,
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
            }}
          >
            ✨
          </motion.span>
        ))}
      </div>

      {/* 🎉 Card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-3xl p-8 max-w-md text-center shadow-2xl"
      >
        <h1 className="text-3xl font-extrabold mb-4">
          🎉 عيد ميلاد سعيد 🎉
        </h1>

        <AvatarGold name={name} />

        <div className="mb-6">
          <GoldenName name={name} />
        </div>

        <p className="mb-6 font-semibold">
          منصة المستشار التعليمية تتمنى لك عامًا مليئًا بالنجاح والتفوق ✨🎓
        </p>

        <div className="flex justify-center gap-4 text-4xl mb-6">
          🎂 🎁 🎈 🕯️
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-black text-yellow-400 rounded-full font-bold hover:bg-gray-900 transition"
        >
          شكرًا 🎉
        </button>
      </motion.div>
    </div>
  );
}