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

   false = تاريخ الميلاد الحقيقي
   true  = تشغيل عيد الميلاد للاختبار
===================================== */
const FORCE_BIRTHDAY_MODE = false;

export default function Home() {
  const navigate = useNavigate();

  /* =========================================================
     STATES
  ========================================================= */

  const [studentName, setStudentName] = useState("");
  const [userLogged, setUserLogged] = useState(false);
  const [ready, setReady] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);

  /* =========================================================
     FEATURES
  ========================================================= */

  const features = [
    "📘 دروس تفاعلية",
    "📝 اختبارات ذكية تقيس فهمك بدقة",
    "🎥 فيديوهات شرح عالية الجودة",
    "📄 ملفات PDF شاملة لكل المنهج",
    "🏆 متابعة تقدمك في كل درس",
  ];

  /* =========================================================
     COLORS
  ========================================================= */

  const ELECTRIC_BLUE = "#00E5FF";
  const DEEP_GOLD = "#C68A00";

  /* =========================================================
     ELECTRIC COLOR WAVE

     تبدأ:
     أزرق
     ذهبي
     أزرق
     ذهبي
     أزرق

     ثم تنعكس الموجة من الأعلى للأسفل.
     
     العناصر نفسها ثابتة تمامًا.
  ========================================================= */

  const [featureColors, setFeatureColors] = useState(
    features.map((_, index) => index % 2 === 0)
  );

  const [waveIndex, setWaveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureColors((previous) => {
        const next = [...previous];

        next[waveIndex] = !next[waveIndex];

        return next;
      });

      setWaveIndex((previous) => {
        return (previous + 1) % features.length;
      });
    }, 2200);

    return () => {
      clearInterval(interval);
    };
  }, [waveIndex, features.length]);

  /* =========================================================
     AUTH + USER DATA + BIRTHDAY
  ========================================================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        /* =========================================
           NO USER
        ========================================= */

        if (!user) {
          setUserLogged(false);
          setStudentName("");
          setShowBirthday(false);
          setReady(true);

          return;
        }

        setUserLogged(true);

        try {
          /* =========================================
             USER DOCUMENT
          ========================================= */

          const snap = await getDoc(
            doc(db, "users", user.uid)
          );

          let data = {};
          let name = "";

          if (snap.exists()) {
            data = snap.data();

            name =
              data.fullName ||
              data.name ||
              user.displayName ||
              user.email?.split("@")[0] ||
              "";
          } else {
            name =
              user.displayName ||
              user.email?.split("@")[0] ||
              "";
          }

          setStudentName(name);

          /* =========================================
             🎂 BIRTHDAY LOGIC
          ========================================= */

          const today = new Date();

          let isBirthdayToday = false;

          /* =========================================
             TEST MODE
          ========================================= */

          if (FORCE_BIRTHDAY_MODE) {
            isBirthdayToday = true;
          }

          /* =========================================
             REAL BIRTHDAY
          ========================================= */

          else if (data.dateOfBirth) {
            let birthDate = null;

            /* =====================================
               STRING YYYY-MM-DD
            ===================================== */

            if (
              typeof data.dateOfBirth === "string"
            ) {
              const parts =
                data.dateOfBirth.split("-");

              if (parts.length === 3) {
                const year =
                  Number(parts[0]);

                const month =
                  Number(parts[1]);

                const day =
                  Number(parts[2]);

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
            }

            /* =====================================
               FIRESTORE TIMESTAMP
            ===================================== */

            else if (
              data.dateOfBirth &&
              typeof data.dateOfBirth.toDate ===
                "function"
            ) {
              const birth =
                data.dateOfBirth.toDate();

              birthDate = {
                month:
                  birth.getMonth() + 1,

                day:
                  birth.getDate(),
              };
            }

            /* =====================================
               JAVASCRIPT DATE
            ===================================== */

            else if (
              data.dateOfBirth instanceof Date
            ) {
              birthDate = {
                month:
                  data.dateOfBirth.getMonth() + 1,

                day:
                  data.dateOfBirth.getDate(),
              };
            }

            /* =====================================
               COMPARE DAY + MONTH ONLY
            ===================================== */

            if (birthDate) {
              isBirthdayToday =
                birthDate.day ===
                  today.getDate() &&
                birthDate.month ===
                  today.getMonth() + 1;
            }
          }

          setShowBirthday(
            isBirthdayToday
          );

          /* =========================================
             🎵 BIRTHDAY SOUND
          ========================================= */

          if (isBirthdayToday) {
            const audio =
              new Audio(
                "/sounds/preview.mp3"
              );

            audio.volume = 0.6;

            const playSound = () => {
              audio.play().catch(() => {});

              window.removeEventListener(
                "click",
                playSound
              );
            };

            window.addEventListener(
              "click",
              playSound
            );
          }
        } catch (err) {
          console.error(
            "Home Error:",
            err
          );

          setShowBirthday(false);
        } finally {
          setReady(true);
        }
      }
    );

    return () => {
      unsub();
    };
  }, []);

  /* =========================================================
     START JOURNEY
  ========================================================= */

  const handleStartJourney = () => {
    if (!userLogged) {
      navigate("/login");
      return;
    }

    navigate("/student");
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="
        home-wrapper
        flex
        flex-col
        gap-16
        relative
      "
      dir="rtl"
    >
      {/* =================================================
          HERO
      ================================================= */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-12
        "
      >
        {/* =================================================
            TEXT SIDE
        ================================================= */}

        <div
          className="
            w-full
            md:w-1/2
            text-right
          "
        >
          {/* =============================================
              TITLE
          ============================================= */}

          <motion.h1
            className="
              text-4xl
              md:text-6xl
              font-bold
              text-gold
              mb-6
            "
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            مرحبًا بك في منصة المستشار
            التعليمية 🎓
          </motion.h1>

          {/* =============================================
              DESCRIPTION
          ============================================= */}

          <motion.p
            className="
              text-gray-300
              text-lg
              md:text-xl
              mb-10
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          >
            المنصة المتكاملة لدراسة التاريخ
            والجغرافيا — دروس تفاعلية،
            اختبارات ذكية، مواد مرئية وملفات
            PDF تحت إشراف مستر
            <strong className="text-gold">
              {" "}
              خلف محروس
            </strong>
            .
          </motion.p>

          {/* =============================================
              START JOURNEY BUTTON
          ============================================= */}

          {ready && (
            <motion.button
              onClick={handleStartJourney}
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.95,
              }}
              animate={{
                boxShadow: [
                  "0 0 8px rgba(255,215,0,0.55)",
                  "0 0 18px rgba(255,215,0,0.78)",
                  "0 0 8px rgba(255,215,0,0.55)",
                ],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                mb-8
                px-8
                py-4
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

          {/* =================================================
              FEATURES BOX

              ثابتة تمامًا
              الموجة اللونية فقط
          ================================================= */}

          <div
            className="
              relative
              rounded-3xl
              p-6
              space-y-5
              overflow-hidden
            "
            style={{
              border:
                "2px solid #FFD700",

              background:
                "linear-gradient(145deg, rgba(255,215,0,0.035), rgba(0,0,0,0.99))",

              boxShadow:
                "0 0 12px rgba(255,215,0,0.40), " +
                "0 0 26px rgba(255,215,0,0.16), " +
                "inset 0 0 18px rgba(255,215,0,0.05)",
            }}
          >
            {/* =========================================
                FEATURES
            ========================================= */}

            {features.map(
              (item, i) => {
                const activeColor =
                  featureColors[i]
                    ? ELECTRIC_BLUE
                    : DEEP_GOLD;

                return (
                  <div
                    key={i}
                    className="
                      relative
                      z-10
                      text-xl
                      md:text-2xl
                      font-extrabold
                      px-4
                      py-3
                      rounded-xl
                    "
                    style={{
                      background:
                        "#000000",

                      border:
                        "1px solid rgba(255,255,255,0.08)",

                      color:
                        activeColor,

                      textShadow:
                        "none",

                      boxShadow:
                        "none",

                      transform:
                        "none",

                      transition:
                        "color 0.15s linear",
                    }}
                  >
                    {item}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            IMAGE SIDE
        ================================================= */}

        <div
          className="
            w-full
            md:w-1/2
            flex
            flex-col
            items-center
          "
        >
          <motion.img
            src={heroImage}
            alt="المستشار"
            className="
              rounded-2xl
              shadow-xl
              border
              border-gold
              w-full
              max-w-md
            "
          />

          {/* =================================================
              STUDENT NAME
          ================================================= */}

          {ready &&
            userLogged &&
            studentName && (
              <div
                className="
                  relative
                  inline-block
                "
              >
                <motion.h2
                  className="
                    mt-6
                    text-2xl
                    md:text-3xl
                    font-bold
                    text-yellow-400
                    text-center
                  "
                  animate={
                    showBirthday
                      ? {
                          scale: [
                            1.05,
                            1,
                            1.05,
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  👋 أهلاً بك يا{" "}
                  {studentName}
                </motion.h2>

                <NameGoldenBurst
                  active={
                    showBirthday
                  }
                />
              </div>
            )}

          {/* =================================================
              BIRTHDAY
          ================================================= */}

          {showBirthday && (
            <div
              className="
                relative
                mt-6
                text-center
              "
            >
              <motion.div
                className="
                  text-3xl
                  font-bold
                  text-gold
                "
                animate={{
                  scale: [
                    1,
                    1.12,
                    1,
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                🎉 اليوم عيد ميلادك 🎂
                <br />
                كل عام وأنت منور المنصة ✨
              </motion.div>

              <BirthdayGlow
                active={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          BOTTOM SLOGAN + GOLDEN FOUNTAIN
      ================================================= */}

      <div
        className="
          relative
          w-full
          border
          border-gold
          rounded-2xl
          py-16
          overflow-hidden
        "
        style={{
          boxShadow:
            "0 0 15px rgba(255,215,0,0.22)",
        }}
      >
        {/* =============================================
            BLUE SLOGAN

            لون أزرق غامق فقط
            حجم أكبر
            بدون Glow

            يتحرك يمين ← يسار ← يمين
            بسلاسة
        ============================================= */}

        <motion.div
          className="
            relative
            z-10
            flex
            justify-center
            items-center
            w-full
            whitespace-nowrap
            px-6
          "
          animate={{
            x: [
              0,
              -80,
              0,
            ],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            color:
              "#006F8F",

            /* =====================================
               تكبير الشعار فقط
            ===================================== */

            fontSize:
              "2em",

            fontWeight:
              900,

            lineHeight:
              1.4,

            textShadow:
              "none",
          }}
        >
          اعظم القيم في الحياة هو النجاح ✨

          <span
            style={{
              marginInlineStart:
                "2.5rem",
            }}
          >
            اوصل لحلمك بعلمك
          </span>
        </motion.div>

        {/* =============================================
            GOLDEN FOUNTAIN
        ============================================= */}

        <div
          className="
            absolute
            inset-0
            top-10
            pointer-events-none
          "
        >
          <GoldenFountain
            active={true}
          />
        </div>
      </div>
    </div>
  );
}