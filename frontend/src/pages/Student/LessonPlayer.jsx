// =========================================================
// frontend/src/pages/Student/LessonPlayer.jsx
// =========================================================

import "./LessonPlayer.css";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import {
  db,
  storage,
} from "../../firebase";

import {
  useAuth,
} from "../../contexts/AuthContext";

import api from "../../utils/api";


// =========================================================
// COMPONENT
// =========================================================

export default function LessonPlayer({
  resolvedLessonId = "",
}) {

  // =======================================================
  // ROUTE PARAMETERS
  // =======================================================

  const {
    gradeId,
    subjectId,
    unitId,
    lessonId: routeLessonId,
  } = useParams();

  const navigate =
    useNavigate();


  // =======================================================
  // AUTH
  // =======================================================

   const {
    role,
    loading: authLoading,
    isSubscriptionActive,
    user,
   } = useAuth();

  // =======================================================
  // LESSON IDS
  // =======================================================
  //
  // PublicLessonResolver:
  //
  // publicLessonId
  //        ↓
  // real lesson document ID
  //        ↓
  // resolvedLessonId
  //
  // We ALWAYS prefer resolvedLessonId.
  // =======================================================

  const actualLessonId =
    resolvedLessonId ||
    routeLessonId ||
    "";

  const publicLessonId =
    routeLessonId ||
    "";


  // =======================================================
  // LESSON STATE
  // =======================================================

  const [
    lesson,
    setLesson,
  ] =
    useState(null);

  const [
    lessonLoading,
    setLessonLoading,
  ] =
    useState(true);


  // =======================================================
  // VIDEO STATE
  // =======================================================

  /*
   * videoAvailable:
   *
   * Does this lesson have a protected video?
   *
   * This is ONLY a boolean.
   *
   * It does NOT contain:
   * - youtubeVideoId
   * - youtubeUrl
   * - videoKey
   */

  const [
    videoAvailable,
    setVideoAvailable,
  ] =
    useState(false);


  /*
   * videoUrl:
   *
   * Only populated after the protected backend
   * grants playback access.
   */

  const [
    videoUrl,
    setVideoUrl,
  ] =
    useState("");


  const [
    videoLoading,
    setVideoLoading,
  ] =
    useState(false);


  /*
   * Student must explicitly open the video.
   */

  const [
    videoUnlocked,
    setVideoUnlocked,
  ] =
    useState(false);

  // =======================================================
  // ROTATING PLAYBACK SESSION
  // =======================================================
  const [playbackSession, setPlaybackSession] = useState(null);
  const currentVideoTimeRef = useRef(0);
  const rotationTimerRef = useRef(null);


  /*
   * Student watermark security.
   * 12 seconds visible + 3 seconds hidden, then a new position.
   */

  const [watermarkPosition, setWatermarkPosition] = useState(0);
  const [watermarkVisible, setWatermarkVisible] = useState(true);
  const [watermarkTime, setWatermarkTime] = useState("");

  useEffect(() => {
    const positions = [
      { left: "50%", top: "32%" },
      { left: "18%", top: "20%" },
      { left: "82%", top: "20%" },
      { left: "28%", top: "38%" },
      { left: "72%", top: "38%" },
      { left: "18%", top: "48%" },
      { left: "82%", top: "48%" },
      { left: "36%", top: "18%" },
      { left: "64%", top: "18%" },
      { left: "50%", top: "52%" },
      { left: "24%", top: "54%" },
      { left: "76%", top: "54%" },
    ];

    let visibleTimer;
    let hiddenTimer;
    let clockTimer;

    const updateClock = () => {
      setWatermarkTime(
        new Date().toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    const cycleWatermark = () => {
      // Keep the watermark visible for exactly 12 seconds.
      setWatermarkVisible(true);
      visibleTimer = window.setTimeout(() => {
        // Hide for exactly 3 seconds before changing position.
        setWatermarkVisible(false);
        hiddenTimer = window.setTimeout(() => {
          setWatermarkPosition((current) =>
            (current + 1) % positions.length
          );
          updateClock();
          cycleWatermark();
        }, 3000);
      }, 12000);
    };

    updateClock();
    cycleWatermark();
    clockTimer = window.setInterval(updateClock, 1000);

    return () => {
      window.clearInterval(clockTimer);
      if (visibleTimer) window.clearTimeout(visibleTimer);
      if (hiddenTimer) window.clearTimeout(hiddenTimer);
    };
  }, []);

  // PDF STATE
  // =======================================================

  const [
    pdfUrl,
    setPdfUrl,
  ] =
    useState("");

  const [
    pdfProgress,
    setPdfProgress,
  ] =
    useState(0);


  // =======================================================
  // EXAMS
  // =======================================================

  const [
    lessonExams,
    setLessonExams,
  ] =
    useState([]);

  const [
    examLoading,
    setExamLoading,
  ] =
    useState(true);


  // =======================================================
  // ROLE
  // =======================================================

  const isStudent =
    role === "student";

  const isAdmin =
    role === "admin" ||
    role === "teacher" ||
    role === "super-admin";


  // =======================================================
  // SUBSCRIPTION
  // =======================================================

  const subscriptionValid =
    !isStudent ||
    isSubscriptionActive === true;


  // =======================================================
  // WATCH PERMISSION
  // =======================================================

  const canWatchVideo =
    videoAvailable &&
    subscriptionValid &&
    videoUnlocked;


  // =======================================================
  // YOUTUBE PLAYBACK SPEED
  // =======================================================

  const youtubeIframeRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  const [
    playbackRate,
    setPlaybackRate,
  ] = useState(1);



  // =======================================================
  // RESET VIDEO
  // =======================================================

  useEffect(() => {

    setVideoAvailable(
      false
    );

    setVideoUrl(
      ""
    );

    setVideoLoading(
      false
    );

    setVideoUnlocked(
      false
    );

  }, [
    actualLessonId,
  ]);


  // =======================================================
  // LOAD LESSON
  // =======================================================
  //
  // IMPORTANT:
  //
  // The previous version searched for the lesson at:
  //
  // grades/{grade}/subjects/{subject}/units/{unit}/lessons/{id}
  //
  // But the actual lesson document used by the saved lesson
  // and video record is:
  //
  // lessons/{id}
  //
  // Therefore the REAL lesson data is now read from:
  //
  // lessons/{actualLessonId}
  //
  // =======================================================

  useEffect(() => {

    if (
      !actualLessonId
    ) {

      setLesson(
        null
      );

      setPdfUrl(
        ""
      );

      setLessonLoading(
        false
      );

      return undefined;
    }


    let cancelled =
      false;


    setLessonLoading(
      true
    );


    /*
     * IMPORTANT:
     *
     * Create the Firestore reference INSIDE the effect.
     *
     * Do NOT put a freshly-created doc reference in the
     * dependency array.
     *
     * This prevents the previous infinite subscription /
     * request loop.
     */

    const lessonRef =
      doc(
        db,
        "lessons",
        actualLessonId
      );


    const unsubscribe =
      onSnapshot(

        lessonRef,

        (snapshot) => {

          if (
            cancelled
          ) {
            return;
          }


          if (
            !snapshot.exists()
          ) {

            console.error(
              "❌ Lesson document does not exist:",
              {
                collection:
                  "lessons",

                actualLessonId,
              }
            );


            setLesson(
              null
            );

            setPdfUrl(
              ""
            );

            setLessonLoading(
              false
            );

            return;
          }


          const data =
            snapshot.data() ||
            {};


          setLesson(
            data
          );


          /*
           * PDF remains part of the regular lesson document.
           */

          setPdfUrl(
            data.pdfUrl ||
            ""
          );


          /*
           * NEVER read:
           *
           * data.videoUrl
           *
           * here.
           *
           * Protected video is completely separated.
           */

          setLessonLoading(
            false
          );
        },

        (error) => {

          if (
            cancelled
          ) {
            return;
          }


          console.error(
            "❌ Lesson loading error:",
            error
          );


          setLesson(
            null
          );

          setPdfUrl(
            ""
          );

          setLessonLoading(
            false
          );
        }
      );


    return () => {

      cancelled =
        true;

      unsubscribe();
    };

  }, [
    actualLessonId,
  ]);


  // =======================================================
  // VIDEO STATUS
  // =======================================================
  //
  // Student asks the backend:
  //
  // "Does this lesson have a protected video?"
  //
  // The response should contain only:
  //
  // {
  //   available: true
  // }
  //
  // No YouTube URL.
  // No YouTube ID.
  // No video key.
  // =======================================================

  useEffect(() => {

    if (
      lessonLoading ||
      !actualLessonId
    ) {

      return undefined;
    }


    let cancelled =
      false;


    const checkVideo =
      async () => {

        try {

          const response =
            await api.get(
              `/api/videos/${encodeURIComponent(
                actualLessonId
              )}/status`
            );


          if (
            cancelled
          ) {
            return;
          }


          const available =
            response.data
              ?.video
              ?.available ===
            true;


          setVideoAvailable(
            available
          );

        } catch (error) {

          if (
            cancelled
          ) {
            return;
          }


          console.error(
            "❌ Protected video status error:",
            error
          );


          setVideoAvailable(
            false
          );
        }
      };


    checkVideo();


    return () => {

      cancelled =
        true;
    };

  }, [
    lessonLoading,
    actualLessonId,
  ]);


  // =======================================================
  // LOAD VIDEO PLAYBACK
  // =======================================================
  //
  // Only happens when:
  //
  // 1. lesson exists
  // 2. video exists
  // 3. student has active subscription
  //
  // Backend performs the final authorization.
  // =======================================================

  useEffect(() => {

    if (
      lessonLoading ||
      !actualLessonId ||
      !videoAvailable
    ) {

      setVideoUrl(
        ""
      );

      setVideoLoading(
        false
      );

      return undefined;
    }


    /*
     * Student without subscription:
     *
     * We KNOW the video exists.
     *
     * We simply do not request playback.
     */

    if (
      isStudent &&
      !subscriptionValid
    ) {

      setVideoUrl(
        ""
      );

      setVideoLoading(
        false
      );

      return undefined;
    }


    let cancelled =
      false;


    const loadVideo =
      async () => {

        try {

          setVideoLoading(
            true
          );


          setVideoUrl(
            ""
          );


          const response =
            await api.get(
              `/api/videos/${encodeURIComponent(
                actualLessonId
              )}/access`
            );


          if (
            cancelled
          ) {
            return;
          }


          const video = response.data?.video || null;
          const gateUrl = video?.gateUrl || "";

          if (gateUrl) {
            setVideoUrl(gateUrl);
            setPlaybackSession(video.playbackSession || null);
            setVideoUnlocked(!isStudent);
          } else {
            setVideoUrl("");
            setPlaybackSession(null);
          }

        } catch (error) {

          if (
            cancelled
          ) {
            return;
          }


          console.error(
            "❌ Protected video playback error:",
            error
          );


          setVideoUrl(
            ""
          );

        } finally {

          if (
            !cancelled
          ) {

            setVideoLoading(
              false
            );
          }
        }
      };


    loadVideo();


    return () => {

      cancelled =
        true;
    };

  }, [
    lessonLoading,
    actualLessonId,
    videoAvailable,
    isStudent,
    subscriptionValid,
  ]);


  // =======================================================
  // OPEN VIDEO
  // =======================================================

  const unlockVideo =
    () => {

      if (
        !videoAvailable
      ) {
        return;
      }


      if (
        isStudent &&
        !subscriptionValid
      ) {
        return;
      }


      if (
        !videoUrl
      ) {
        return;
      }


      setVideoUnlocked(
        true
      );
    };


  // =======================================================
  // VIDEO PROTECTION
  // =======================================================

  const protectVideoContainer =
    (event) => {

      event.preventDefault();
    };


// =======================================================
// =======================================================
// ROTATING SECURE VIDEO GATE
// =======================================================

const youtubeProtectedUrl = videoUrl || "";

// The video iframe is served by the backend Gate, not by the frontend.
// Commands must therefore be sent to the Gate origin.
const getVideoGateOrigin = () => {
  try {
    return new URL(youtubeProtectedUrl, window.location.href).origin;
  } catch (_) {
    return window.location.origin;
  }
};

const sendYouTubeSpeedMessage = (rate) => {
  const iframe = youtubeIframeRef.current;
  if (!iframe?.contentWindow) return;

  try {
    iframe.contentWindow.postMessage(
      {
        type: "MOSTASHAR_YOUTUBE_COMMAND",
        func: "setPlaybackRate",
        args: [rate],
      },
      getVideoGateOrigin()
    );
  } catch (_) {}
};

const applyPlaybackRate = (rate) => {
  sendYouTubeSpeedMessage(rate);
};

const changePlaybackRate = (rate) => {
  setPlaybackRate(rate);
  applyPlaybackRate(rate);

  // Retry after the Gate/YouTube player finishes loading.
  [200, 500, 1000].forEach((delay) => {
    window.setTimeout(() => applyPlaybackRate(rate), delay);
  });
};

useEffect(() => {
  const handleGateMessage = (event) => {
    const gateOrigin = getVideoGateOrigin();

    if (gateOrigin && event.origin !== gateOrigin) return;

    const data = event.data;
    if (!data || data.type !== "MOSTASHAR_YOUTUBE_EVENT") return;

    const currentTime = data.data?.info?.currentTime;
    if (Number.isFinite(Number(currentTime))) {
      currentVideoTimeRef.current = Number(currentTime);
    }
  };

  window.addEventListener("message", handleGateMessage);

  return () => {
    window.removeEventListener("message", handleGateMessage);
  };
}, [youtubeProtectedUrl]);

useEffect(() => {
  if (!canWatchVideo || !actualLessonId || !playbackSession?.expiresAt) {
    if (rotationTimerRef.current) window.clearTimeout(rotationTimerRef.current);
    rotationTimerRef.current = null;
    return undefined;
  }

  let cancelled = false;

  const rotate = async () => {
    try {
      currentVideoTimeRef.current = 0;

      const iframe = youtubeIframeRef.current;
      if (iframe?.contentWindow) {
        try {
          iframe.contentWindow.postMessage(
            {
              type: "MOSTASHAR_YOUTUBE_COMMAND",
              func: "getCurrentTime",
              args: [],
            },
            getVideoGateOrigin()
          );
        } catch (_) {}
      }

      await new Promise((resolve) => window.setTimeout(resolve, 300));

      const response = await api.get(
        `/api/videos/${encodeURIComponent(actualLessonId)}/access`
      );
      if (cancelled) return;

      const video = response.data?.video || null;
      const nextGateUrl = video?.gateUrl || "";
      if (!nextGateUrl) throw new Error("New playback gate was not issued");

      const start = Math.max(0, Math.floor(currentVideoTimeRef.current || 0));
      const url = new URL(nextGateUrl, window.location.origin);
      if (start > 0) url.searchParams.set("start", String(start));

      setPlaybackSession(video.playbackSession || null);
      setVideoUrl(url.toString());
    } catch (error) {
      if (!cancelled) console.error("❌ Playback session rotation failed:", error);
    }
  };

  const expiresAtMs = new Date(playbackSession.expiresAt).getTime();
  const delay = Math.max(5000, expiresAtMs - Date.now() - 5000);
  rotationTimerRef.current = window.setTimeout(rotate, delay);

  return () => {
    cancelled = true;
    if (rotationTimerRef.current) window.clearTimeout(rotationTimerRef.current);
    rotationTimerRef.current = null;
  };
}, [canWatchVideo, actualLessonId, playbackSession?.expiresAt]);


// =======================================================
  // PDF UPLOAD
  // =======================================================

  const uploadPdf =
    (file) => {

      if (
        !file ||
        !actualLessonId
      ) {
        return;
      }


      setPdfProgress(
        0
      );


      const storageReference =
        ref(
          storage,
          `lessons/${actualLessonId}/pdf_${Date.now()}`
        );


      const uploadTask =
        uploadBytesResumable(
          storageReference,
          file
        );


      uploadTask.on(

        "state_changed",

        (snapshot) => {

          const progress =
            (
              snapshot.bytesTransferred /
              snapshot.totalBytes
            ) * 100;


          setPdfProgress(
            Math.floor(
              progress
            )
          );
        },

        (error) => {

          console.error(
            "❌ PDF upload error:",
            error
          );


          alert(
            "حدث خطأ أثناء رفع ملف PDF"
          );
        },

        async () => {

          try {

            const url =
              await getDownloadURL(
                uploadTask.snapshot.ref
              );


            const lessonRef =
              doc(
                db,
                "lessons",
                actualLessonId
              );


            await updateDoc(
              lessonRef,
              {
                pdfUrl:
                  url,
              }
            );


            setPdfUrl(
              url
            );


            setPdfProgress(
              100
            );

          } catch (error) {

            console.error(
              "❌ Error saving PDF URL:",
              error
            );


            alert(
              "تم رفع الملف لكن حدث خطأ أثناء حفظ الرابط."
            );
          }
        }
      );
    };


  // =======================================================
  // LIVE CLASS NAVIGATION
  // =======================================================

  const joinWhiteboard =
    () => {

      navigate(
        `/student/live/${gradeId}/${subjectId}/${unitId}/${actualLessonId}`
      );
    };


  const joinLiveStream =
    () => {

      navigate(
        `/live/${gradeId}/${subjectId}/${unitId}/${actualLessonId}`
      );
    };


  // =======================================================
  // EXAMS
  // =======================================================

  useEffect(() => {

    if (
      lessonLoading ||
      !actualLessonId
    ) {

      setLessonExams(
        []
      );

      setExamLoading(
        false
      );

      return undefined;
    }


    let cancelled =
      false;


    const loadExams =
      async () => {

        try {

          setExamLoading(
            true
          );


          const response =
            await api.get(
              "/api/exams"
            );


          const allExams =
            Array.isArray(
              response.data?.exams
            )
              ? response.data.exams
              : [];


          // =================================================
          // NORMALIZE IDS
          // =================================================

          const normalizeId =
            (value) => {

              if (
                value ===
                  undefined ||
                value ===
                  null
              ) {

                return "";
              }


              return String(
                value
              )
                .trim()
                .toLowerCase()
                .replace(
                  /[-_\s]/g,
                  ""
                );
            };


          const currentGrade =
            normalizeId(
              gradeId
            );


          const currentSubject =
            normalizeId(
              subjectId
            );


          const currentUnit =
            normalizeId(
              unitId
            );


          const currentLesson =
            normalizeId(
              actualLessonId
            );


          const currentPublicLesson =
            normalizeId(
              publicLessonId
            );


          console.log(
            "Exam matching:",
            {
              currentGrade,
              currentSubject,
              currentUnit,
              currentLesson,
              currentPublicLesson,
              totalExams:
                allExams.length,
            }
          );


          // =================================================
          // GRADE + SUBJECT + UNIT
          // =================================================

          const matchingExams =
            allExams.filter(
              (exam) => {

                const examGrade =
                  normalizeId(
                    exam.gradeId
                  );


                const examSubject =
                  normalizeId(
                    exam.subject
                  );


                const examUnit =
                  normalizeId(
                    exam.unitId
                  );


                const gradeMatches =
                  !exam.gradeId ||
                  examGrade ===
                    currentGrade;


                const subjectMatches =
                  !exam.subject ||
                  examSubject ===
                    currentSubject;


                const unitMatches =
                  !exam.unitId ||
                  examUnit ===
                    currentUnit;


                return (
                  gradeMatches &&
                  subjectMatches &&
                  unitMatches
                );
              }
            );


          // =================================================
          // DIRECT LESSON MATCH
          // =================================================

          const exactLessonExams =
            matchingExams.filter(
              (exam) => {

                const lessonIds =
                  Array.isArray(
                    exam
                      .questionBankSettings
                      ?.lessonIds
                  )
                    ? exam
                        .questionBankSettings
                        .lessonIds
                    : [];


                const lessonIdMatch =
                  lessonIds.some(
                    (id) => {

                      const normalized =
                        normalizeId(
                          id
                        );


                      return (
                        normalized ===
                          currentLesson ||
                        normalized ===
                          currentPublicLesson
                      );
                    }
                  );


                const questionLessonMatch =
                  Array.isArray(
                    exam.questions
                  ) &&
                  exam.questions.some(
                    (question) => {

                      const normalized =
                        normalizeId(
                          question.lessonId
                        );


                      return (
                        normalized ===
                          currentLesson ||
                        normalized ===
                          currentPublicLesson
                      );
                    }
                  );


                return (
                  lessonIdMatch ||
                  questionLessonMatch
                );
              }
            );


          // =================================================
          // STUDENT = PUBLISHED ONLY
          // =================================================

          let finalExams =
            exactLessonExams;


          if (
            role === "student"
          ) {

            finalExams =
              finalExams.filter(
                (exam) =>
                  exam.status ===
                  "published"
              );
          }


          console.log(
            "Final lesson exams:",
            finalExams
          );


          if (
            !cancelled
          ) {

            setLessonExams(
              finalExams
            );
          }

        } catch (error) {

          if (
            !cancelled
          ) {

            console.error(
              "حدث خطأ أثناء تحميل الامتحانات:",
              error
            );


            setLessonExams(
              []
            );
          }

        } finally {

          if (
            !cancelled
          ) {

            setExamLoading(
              false
            );
          }
        }
      };


    loadExams();


    return () => {

      cancelled =
        true;
    };

  }, [
    lessonLoading,
    actualLessonId,
    publicLessonId,
    gradeId,
    subjectId,
    unitId,
    role,
  ]);


  // =======================================================
  // EXAM OPEN
  // =======================================================

  const openExam =
    (examId) => {

      if (
        !examId
      ) {

        alert(
          "لم يتم العثور على رقم الامتحان"
        );

        return;
      }


      navigate(
        `/student/exam/${examId}`
      );
    };


  // =======================================================
  // EXAM ADMIN
  // =======================================================

  const addExam =
    () => {

      navigate(
        `/teacher/exam-builder/${gradeId}/${subjectId}/${unitId}/${actualLessonId}`
      );
    };


  const editExam =
    () => {

      navigate(
        `/teacher/exam-edit/${gradeId}/${subjectId}/${unitId}/${actualLessonId}`
      );
    };


  const previewExam =
    () => {

      navigate(
        `/teacher/exam-preview/${gradeId}/${subjectId}/${unitId}/${actualLessonId}`
      );
    };


  const deleteExam =
    () => {

      navigate(
        `/super-admin/exam-delete/${gradeId}/${subjectId}/${unitId}/${actualLessonId}`
      );
    };


  // =======================================================
  // GRADE NAMES
  // =======================================================

  const getGradeName =
    (id) => {

      const grades = {

        sec1:
          "الصف الأول الثانوي",

        sec2:
          "الصف الثاني الثانوي",

        sec3:
          "الصف الثالث الثانوي",

      };


      return (
        grades[id] ||
        id ||
        "غير محدد"
      );
    };


  // =======================================================
  // SUBJECT NAMES
  // =======================================================

  const getSubjectName =
    (id) => {

      const subjects = {

        history:
          "التاريخ",

        geography:
          "الجغرافيا",

        arabic:
          "اللغة العربية",

        english:
          "اللغة الإنجليزية",

        physics:
          "الفيزياء",

        chemistry:
          "الكيمياء",

        biology:
          "الأحياء",

        mathematics:
          "الرياضيات",

      };


      return (
        subjects[id] ||
        id ||
        "غير محددة"
      );
    };


  // =======================================================
  // LOADING
  // =======================================================

  if (
    lessonLoading ||
    authLoading
  ) {

    return (

      <div
        className="lesson-player"
      >

        <div
          className="lesson-block"

          style={{
            minHeight:
              "220px",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            flexDirection:
              "column",

            gap:
              "12px",

            textAlign:
              "center",
          }}
        >

          <div
            style={{
              fontSize:
                "40px",
            }}
          >
            ⏳
          </div>


          <h3
            style={{
              margin:
                0,

              color:
                "#ffd700",
            }}
          >
            جاري فتح الدرس...
          </h3>


          <p
            style={{
              margin:
                0,

              color:
                "#ccc",
            }}
          >
            يتم تجهيز محتوى الدرس...
          </p>

        </div>

      </div>
    );
  }


  // =======================================================
  // LESSON NOT FOUND
  // =======================================================

  if (
    !lesson ||
    !actualLessonId
  ) {

    return (

      <div
        className="lesson-player"
      >

        <button
          className="back-btn"

          onClick={() =>
            navigate(-1)
          }
        >
          رجوع
        </button>


        <div
          className="lesson-block"

          style={{
            minHeight:
              "260px",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            flexDirection:
              "column",

            gap:
              "14px",

            textAlign:
              "center",
          }}
        >

          <div
            style={{
              fontSize:
                "44px",
            }}
          >
            ⚠️
          </div>


          <h3
            style={{
              margin:
                0,

              color:
                "#ffd700",
            }}
          >
            لم يتم العثور على الدرس
          </h3>


          <p
            style={{
              margin:
                0,

              color:
                "#ccc",

              lineHeight:
                1.8,
            }}
          >
            تعذر العثور على الدرس المطلوب.
          </p>


          <button
            className="gold-btn"

            onClick={() =>
              navigate(-1)
            }
          >
            العودة
          </button>

        </div>

      </div>
    );
  }


  // =======================================================
  // MAIN UI
  // =======================================================

  return (

    <div
      className="lesson-player"
    >

      {/* =================================================
          BACK
      ================================================= */}

      <button
        className="back-btn"

        onClick={() =>
          navigate(-1)
        }
      >
        رجوع
      </button>


      {/* =================================================
          TITLE
      ================================================= */}

      <h2
        className="lesson-title"
      >
        {
          lesson?.title ||
          "الدرس"
        }
      </h2>


      {/* =================================================
          LIVE CLASS
      ================================================= */}

      <div
        className="lesson-block"
      >

        <h3>
          الحصة المباشرة
        </h3>


        <div
          className="button-row"
        >

          <button
            className="gold-btn"

            onClick={
              joinWhiteboard
            }
          >
            🧠 دخول السبورة
          </button>


          <button
            className="gold-btn"

            onClick={
              joinLiveStream
            }
          >
            🎥 دخول البث المباشر
          </button>

        </div>

      </div>


      {/* =================================================
          VIDEO
      ================================================= */}

      <div
        className="lesson-block"
      >

        <h3>
          فيديو الدرس
        </h3>


                  {/* =================================================
                      PLAYBACK SPEED CONTROLS
                  ================================================== */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginTop: "14px",
                      direction: "rtl",
                      padding: "4px 0 10px",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffd700",
                        fontSize: "14px",
                        fontWeight: "700",
                        marginLeft: "6px",
                      }}
                    >
                      سرعة التشغيل:
                    </span>

                    {[1, 1.25, 1.5, 1.75, 2].map(
                      (rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() =>
                            changePlaybackRate(rate)
                          }
                          style={{
                            minWidth: "58px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border:
                              playbackRate === rate
                                ? "2px solid #ffd700"
                                : "1px solid rgba(212,175,55,0.55)",
                            background:
                              playbackRate === rate
                                ? "#d4af37"
                                : "#111",
                            color:
                              playbackRate === rate
                                ? "#111"
                                : "#ffd700",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition:
                              "all 0.2s ease",
                          }}
                        >
                          {rate}×
                        </button>
                      )
                    )}
                  </div>



        <div
          onContextMenu={
            protectVideoContainer
          }

          onCopy={
            protectVideoContainer
          }

          onCut={
            protectVideoContainer
          }

          onDragStart={
            protectVideoContainer
          }

          style={{
            position:
              "relative",

            width:
              "100%",

            overflow:
              "hidden",

            borderRadius:
              "12px",

            userSelect:
              "none",

            WebkitUserSelect:
              "none",
          }}
        >

          {/* =============================================
              NO VIDEO
          ============================================= */}

          {!videoAvailable && (

            <div
              style={{
                minHeight:
                  "360px",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                flexDirection:
                  "column",

                gap:
                  "14px",

                padding:
                  "30px",

                boxSizing:
                  "border-box",

                background:
                  "linear-gradient(135deg, #111, #1b1b1b)",

                border:
                  "1px solid rgba(212,175,55,0.45)",

                textAlign:
                  "center",
              }}
            >

              <div
                style={{
                  fontSize:
                    "42px",
                }}
              >
                🎥
              </div>


              <h4
                style={{
                  margin:
                    0,

                  color:
                    "#ffd700",

                  fontSize:
                    "22px",
                }}
              >
                لا يوجد فيديو متاح لهذا الدرس
              </h4>

            </div>
          )}


          {/* =============================================
              VIDEO EXISTS
          ============================================= */}

          {videoAvailable && (

            <>

              {/* =========================================
                  NON-SUBSCRIBED STUDENT
              ========================================= */}

              {isStudent &&
              !subscriptionValid ? (

                <div
                  style={{
                    minHeight:
                      "360px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    flexDirection:
                      "column",

                    gap:
                      "14px",

                    padding:
                      "30px",

                    boxSizing:
                      "border-box",

                    background:
                      "linear-gradient(135deg, #111, #1b1b1b)",

                    border:
                      "1px solid rgba(220,38,38,0.55)",

                    textAlign:
                      "center",
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        "44px",
                    }}
                  >
                    🔒
                  </div>


                  <h4
                    style={{
                      margin:
                        0,

                      color:
                        "#ffd700",

                      fontSize:
                        "23px",
                    }}
                  >
                    الفيديو متاح للمشتركين فقط
                  </h4>


                  <p
                    style={{
                      margin:
                        0,

                      maxWidth:
                        "560px",

                      color:
                        "#ccc",

                      lineHeight:
                        1.8,
                    }}
                  >
                    هذا الدرس يحتوي على فيديو،
                    ولكن تشغيله يتطلب اشتراكًا فعالًا.
                  </p>

                </div>

              ) : videoLoading ? (

                /* =======================================
                   LOADING
                ======================================= */

                <div
                  style={{
                    minHeight:
                      "360px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    flexDirection:
                      "column",

                    gap:
                      "14px",

                    padding:
                      "30px",

                    boxSizing:
                      "border-box",

                    background:
                      "linear-gradient(135deg, #111, #1b1b1b)",

                    border:
                      "1px solid rgba(212,175,55,0.45)",

                    textAlign:
                      "center",
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        "40px",
                    }}
                  >
                    🔐
                  </div>


                  <h4
                    style={{
                      margin:
                        0,

                      color:
                        "#ffd700",
                    }}
                  >
                    جاري تجهيز الفيديو
                  </h4>


                  <p
                    style={{
                      margin:
                        0,

                      color:
                        "#ccc",
                    }}
                  >
                    يتم التحقق من صلاحية الوصول للفيديو...
                  </p>

                </div>

              ) : canWatchVideo ? (

                /* =======================================
                   PLAYER
                ======================================= */

                <>

                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      overflow: "hidden",
                      borderRadius: "12px",
                      background: "#000",
                    }}
                  >

                  <iframe
                    ref={youtubeIframeRef}
                    className="video-player"

                    src={
                      youtubeProtectedUrl
                    }

                    onLoad={() => {
                      // The official API may not be ready yet, so use
                      // the iframe command as an immediate fallback.
                      window.setTimeout(() => {
                        applyPlaybackRate(playbackRate);
                      }, 500);
                    }}

                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture
                    "

                    allowFullScreen

                    title="فيديو الدرس"

                    referrerPolicy="
                      strict-origin-when-cross-origin
                    "
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      border: 0,
                    }}
                  />


                  {/* =================================================
                      YOUTUBE OUTBOUND CLICK SHIELD
                      -------------------------------------------------
                      Transparent shield over the lower part of the
                      YouTube iframe. It prevents clicks on:
                        - More videos
                        - Watch on YouTube
                        - end-screen cards / outbound actions

                      It does NOT change the YouTube URL or replace
                      the player.
                  ================================================== */}

                  <div
                    aria-hidden="true"
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onPointerUp={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onMouseUp={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onTouchStart={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: "118px",
                      zIndex: 999,
                      background: "transparent",
                      pointerEvents: "auto",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      touchAction: "none",
                      cursor: "default",
                    }}
                  />

                  {/* ==================================
                      LIVE STUDENT WATERMARK
                      12s visible / 3s hidden / positions kept away from bottom shield
                  ================================== */}

                  {isStudent && user && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2147483646,
                        pointerEvents: "none",
                        overflow: "hidden",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: ["50%", "18%", "82%", "82%", "18%", "28%", "72%", "72%", "35%", "65%", "50%"][watermarkPosition],
                          top: ["20%", "28%", "28%", "52%", "52%", "42%", "42%", "56%", "36%", "36%", "56%"][watermarkPosition],
                          transform: "translate(-50%, -50%)",
                          opacity: watermarkVisible ? 1 : 0,
                          visibility: watermarkVisible ? "visible" : "hidden",
                          transition: "left 1.8s ease-in-out, top 1.8s ease-in-out, opacity 0.35s ease-in-out",
                          zIndex: 1002,
                          minWidth: "230px",
                          maxWidth: "min(360px, 70%)",
                          padding: "10px 16px",
                          boxSizing: "border-box",
                          borderRadius: "8px",
                          background: "rgba(0,0,0,0.58)",
                          border: "1px solid rgba(255,255,255,0.20)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
                          color: "rgba(255,255,255,0.82)",
                          fontSize: "11px",
                          lineHeight: 1.7,
                          fontWeight: 700,
                          textAlign: "center",
                          direction: "rtl",
                          textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                        }}
                      >
                        <div>
                          {user?.displayName || user?.name || "طالب"}
                        </div>
                        <div
                          style={{
                            direction: "ltr",
                            overflowWrap: "anywhere",
                            fontSize: "10px",
                            fontWeight: 600,
                            opacity: 0.9,
                          }}
                        >
                          {user?.email || "student@example.com"}
                        </div>
                        <div
                          style={{
                            direction: "ltr",
                            marginTop: "2px",
                            fontSize: "10px",
                            opacity: 0.86,
                          }}
                        >
                          وقت المشاهدة: {watermarkTime}
                        </div>
                      </div>
                    </div>
                  )}

                  </div>

                </>

              ) : (

                /* =======================================
                   VIDEO EXISTS BUT LOCKED
                ======================================= */

                <div
                  style={{
                    minHeight:
                      "360px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    flexDirection:
                      "column",

                    gap:
                      "14px",

                    padding:
                      "30px",

                    boxSizing:
                      "border-box",

                    background:
                      "linear-gradient(135deg, #111, #1b1b1b)",

                    border:
                      "1px solid rgba(212,175,55,0.45)",

                    textAlign:
                      "center",
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        "42px",
                    }}
                  >
                    🔐
                  </div>


                  <h4
                    style={{
                      margin:
                        0,

                      color:
                        "#ffd700",

                      fontSize:
                        "22px",
                    }}
                  >
                    الفيديو محمي داخل المنصة
                  </h4>


                  <p
                    style={{
                      margin:
                        0,

                      maxWidth:
                        "520px",

                      textAlign:
                        "center",

                      color:
                        "#ccc",

                      lineHeight:
                        1.8,
                    }}
                  >
                    الفيديو موجود لهذا الدرس.
                    اضغط على الزر التالي لفتحه.
                  </p>


                  <button
                    className="gold-btn"

                    type="button"

                    onClick={
                      unlockVideo
                    }
                  >
                    ▶ فتح الفيديو
                  </button>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#999",
                    }}
                  >
                    سيعمل الفيديو داخل منصة المستشار.
                  </div>

                </div>
              )}

            </>
          )}

        </div>

      </div>


      {/* =================================================
          PDF
      ================================================= */}

      <div
        className="lesson-block"
      >

        <h3>
          PDF
        </h3>


        {isAdmin && (

          <div
            className="button-row"
          >

            <label
              className="gold-btn"
            >

              رفع الملف


              <input
                hidden

                type="file"

                accept="application/pdf"

                onChange={
                  (event) =>
                    uploadPdf(
                      event.target.files[0]
                    )
                }
              />

            </label>

          </div>
        )}


        {pdfUrl && (

          <iframe
            src={
              pdfUrl
            }

            title="PDF الدرس"

            style={{
              width:
                "100%",

              height:
                "650px",

              marginTop:
                "15px",

              borderRadius:
                "10px",

              border:
                "2px solid gold",
            }}
          />

        )}


        {pdfProgress > 0 && (

          <div
            className="progress-box"
          >

            <div
              className="progress-bar"

              style={{
                width:
                  `${pdfProgress}%`,
              }}
            />


            <span>
              {pdfProgress}%
            </span>

          </div>
        )}

      </div>


      {/* =================================================
          EXAMS
      ================================================= */}

      <div
        className="lesson-block"
      >

        <h3>
          الامتحانات
        </h3>


        {examLoading ? (

          <p>
            جاري تحميل الامتحانات...
          </p>

        ) : lessonExams.length ===
          0 ? (

          <p>
            لا يوجد امتحان مرتبط بهذا الدرس حاليًا.
          </p>

        ) : (

          <div
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              gap:
                "15px",

              marginTop:
                "15px",
            }}
          >

            {lessonExams.map(
              (exam) => (

                <div
                  key={
                    exam._id
                  }

                  style={{
                    border:
                      "1px solid #d4af37",

                    borderRadius:
                      "12px",

                    padding:
                      "18px",

                    background:
                      "#111",

                    boxShadow:
                      "0 0 12px rgba(212,175,55,0.25)",
                  }}
                >

                  <h4
                    style={{
                      color:
                        "#ffd700",

                      fontSize:
                        "20px",

                      marginBottom:
                        "10px",
                    }}
                  >
                    📝{" "}
                    {
                      exam.title
                    }
                  </h4>


                  {exam.description && (

                    <p
                      style={{
                        color:
                          "#ccc",

                        marginBottom:
                          "10px",
                      }}
                    >
                      {
                        exam.description
                      }
                    </p>

                  )}


                  <p>
                    المادة:{" "}
                    {
                      getSubjectName(
                        exam.subject ||
                        subjectId
                      )
                    }
                  </p>


                  <p>
                    الصف:{" "}
                    {
                      getGradeName(
                        exam.gradeId ||
                        gradeId
                      )
                    }
                  </p>


                  <p>
                    مدة الامتحان:{" "}
                    {
                      exam.duration ||
                      30
                    }{" "}
                    دقيقة
                  </p>


                  <p>
                    عدد الأسئلة:{" "}
                    {
                      exam.questions?.length ||
                      exam.questionsCount ||
                      0
                    }
                  </p>


                  {exam.status && (

                    <p
                      style={{
                        color:
                          exam.status ===
                          "published"
                            ? "#4ade80"
                            : "#facc15",
                      }}
                    >
                      الحالة:{" "}
                      {
                        exam.status ===
                        "published"
                          ? "متاح"
                          : exam.status
                      }
                    </p>

                  )}


                  <button
                    className="gold-btn"

                    style={{
                      marginTop:
                        "12px",
                    }}

                    onClick={() =>
                      openExam(
                        exam._id
                      )
                    }
                  >
                    دخول الامتحان
                  </button>

                </div>
              )
            )}

          </div>
        )}


        {/* ===============================================
            ADMIN EXAM CONTROLS
        =============================================== */}

        {isAdmin && (

          <div
            className="button-row"

            style={{
              marginTop:
                "15px",
            }}
          >

            <button
              className="gold-btn"

              onClick={
                addExam
              }
            >
              إضافة
            </button>


            <button
              className="gold-btn"

              onClick={
                editExam
              }
            >
              تعديل
            </button>


            <button
              className="gold-btn"

              onClick={
                previewExam
              }
            >
              معاينة
            </button>


            {role ===
              "super-admin" && (

              <button
                className="red-btn"

                onClick={
                  deleteExam
                }
              >
                حذف
              </button>

            )}

          </div>
        )}

      </div>

    </div>
  );
}