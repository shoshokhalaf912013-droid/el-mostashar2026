import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import heroImage from "../assets/main-image.jpg";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import GoldenFountain from "../components/GoldenFountain";
import NameGoldenBurst from "../components/NameGoldenBurst";
import BirthdayGlow from "../components/BirthdayGlow";

/* =====================================
   🎂 Birthday TEST MODE
===================================== */
const FORCE_BIRTHDAY_MODE = false;

export default function Home() {

  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("");
  const [userLogged, setUserLogged] = useState(false);
  const [ready, setReady] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);

  /* ===============================
     معرفة المستخدم + جلب الاسم
  =============================== */
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        setUserLogged(false);
        setStudentName("");
        setReady(true);
        return;
      }

      setUserLogged(true);

      try {

        const snap = await getDoc(doc(db, "users", user.uid));

        let name = "";
        let data = {};

        if (snap.exists()) {
          data = snap.data();
          name =
            data.fullName ||
            data.name ||
            user.displayName ||
            user.email.split("@")[0];
        } else {
          name = user.email.split("@")[0];
        }

        setStudentName(name);

        const today = new Date();
        let isBirthdayToday = false;

        if (FORCE_BIRTHDAY_MODE) {
          isBirthdayToday = true;
        } else if (data.dateOfBirth) {

          let birthDate = null;

          // =========================================
          // قراءة تاريخ الميلاد بأمان
          // =========================================

          if (typeof data.dateOfBirth === "string") {

            // إذا كان التاريخ بالشكل:
            // YYYY-MM-DD
            const parts = data.dateOfBirth.split("-");

            if (parts.length === 3) {
              const year = Number(parts[0]);
              const month = Number(parts[1]);
              const day = Number(parts[2]);

              if (
                Number.isInteger(year) &&
                Number.isInteger(month) &&
                Number.isInteger(day)
              ) {
                birthDate = {
                  month,
                  day,
                };
              }
            }

          } else if (
            data.dateOfBirth &&
            typeof data.dateOfBirth.toDate === "function"
          ) {

            const birth = data.dateOfBirth.toDate();

            birthDate = {
              month: birth.getMonth() + 1,
              day: birth.getDate(),
            };

          } else if (data.dateOfBirth instanceof Date) {

            birthDate = {
              month: data.dateOfBirth.getMonth() + 1,
              day: data.dateOfBirth.getDate(),
            };
          }

          // =========================================
          // عيد الميلاد = نفس اليوم والشهر فقط
          // =========================================

          if (birthDate) {

            isBirthdayToday =
              birthDate.day === today.getDate() &&
              birthDate.month === today.getMonth() + 1;
          }
        }

        if (isBirthdayToday) {
          setShowBirthday(true);

          const audio = new Audio("/sounds/preview.mp3");
          audio.volume = 0.6;

          const playSound = () => {
            audio.play().catch(() => {});
            window.removeEventListener("click", playSound);
          };

          window.addEventListener("click", playSound);
        }

      } catch (err) {
        console.error("Home Error:", err);
      } finally {
        setReady(true);
      }
    });

    return () => unsub();

  }, []);

  /* ===============================
     زر الدخول 🚀
  =============================== */
  const handleStartJourney = () => {

    if (!userLogged) {
      navigate("/login");
      return;
    }

    navigate("/student"); // صفحة الطالب
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="home-wrapper flex flex-col gap-16 relative" dir="rtl">

      <div className="flex flex-col md:flex-row items-center justify-between gap-12">

        {/* ================= النص ================= */}
        <div className="w-full md:w-1/2 text-right">

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-gold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            مرحبًا بك في منصة المستشار التعليمية 🎓
          </motion.h1>

          <motion.p
            className="text-gray-300 text-lg md:text-xl mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            المنصة المتكاملة لدراسة التاريخ والجغرافيا — دروس تفاعلية،
            اختبارات ذكية، مواد مرئية وملفات PDF تحت إشراف مستر
            <strong className="text-gold"> خلف محروس</strong>.
          </motion.p>

          {/* 🚀 زر استكمل رحلتك التعليمية */}
          {ready && (
            <motion.button
              onClick={handleStartJourney}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 10px #FFD700",
                  "0 0 30px #FFD700",
                  "0 0 10px #FFD700",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="
                mb-10
                px-8 py-4
                rounded-2xl
                font-bold
                text-lg
                bg-gradient-to-r
                from-yellow-400
                to-yellow-600
                text-black
                shadow-xl
              "
            >
              🚀 استكمل رحلتك التعليمية
            </motion.button>
          )}

          {/* ================= المميزات ================= */}
          <motion.div
            className="relative rounded-3xl border border-cyan-400 p-6 space-y-5 overflow-hidden"
            style={{
              boxShadow:
                "0 0 20px #00e5ff, inset 0 0 25px rgba(0,229,255,0.25)"
            }}
          >

            {[
              "📘 دروس تفاعلية",
              "📝 اختبارات ذكية تقيس فهمك بدقة",
              "🎥 فيديوهات شرح عالية الجودة",
              "📄 ملفات PDF شاملة لكل المنهج",
              "🏆 متابعة تقدمك في كل درس"
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-xl md:text-2xl font-extrabold px-4 py-3 rounded-xl bg-black/40"
                animate={{
                  color:
                    i % 2 === 0
                      ? ["#FFD700", "#38bdf8", "#FFD700"]
                      : ["#38bdf8", "#FFD700", "#38bdf8"],
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* ================= الصورة ================= */}
        <div className="w-full md:w-1/2 flex flex-col items-center">

          <motion.img
            src={heroImage}
            alt="المستشار"
            className="rounded-2xl shadow-xl border border-gold w-full max-w-md"
          />

          {ready && userLogged && studentName && (
            <div className="relative inline-block">

              <motion.h2
                className="mt-6 text-2xl md:text-3xl font-bold text-yellow-400 text-center"
                animate={showBirthday ? { scale: [1.05,1,1.05] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                👋 أهلاً بك يا {studentName}
              </motion.h2>

              <NameGoldenBurst active={showBirthday} />
            </div>
          )}

          {showBirthday && (
            <div className="relative mt-6 text-center">

              <motion.div
                className="text-3xl font-bold text-gold"
                animate={{ scale: [1,1.12,1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎉 اليوم عيد ميلادك 🎂
                <br />
                كل عام وأنت منور المنصة ✨
              </motion.div>

              <BirthdayGlow active={true} />
            </div>
          )}

        </div>
      </div>

      {/* ================= الشعار السفلى ================= */}
      <motion.div className="relative w-full border border-gold rounded-2xl text-center py-16 text-xl md:text-2xl font-bold overflow-hidden">

        <motion.div
          className="relative z-10 flex flex-wrap justify-center gap-4"
          animate={{ x: [0,20,0], color:["#FFD700","#38bdf8","#FFD700"] }}
          transition={{ duration:4, repeat:Infinity }}
        >
          <span>اعظم القيم في الحياة هو النجاح ✨</span>
          <span>اوصل لحلمك بعلمك</span>
        </motion.div>

        <div className="absolute inset-0 top-10 pointer-events-none">
          <GoldenFountain active={true} />
        </div>

      </motion.div>

    </div>
  );
}
