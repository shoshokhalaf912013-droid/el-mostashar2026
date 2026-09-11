import "./LessonsView.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase";
import { getLessonTitle } from "@/utils/getLessonTitle";
import { usePermissions } from "@/hooks/usePermissions";

export default function LessonsView() {
  const { gradeId, subjectId, unitId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const { canManageLessons } = usePermissions();

  /* =========================================================
     إنشاء Public Lesson ID

     هذا الـID يظهر في رابط الطالب فقط.
     الـFirestore document ID الحقيقي يظل مخفيًا.
  ========================================================= */

  const generatePublicLessonId = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let result = "";

    for (let i = 0; i < 12; i++) {
      result += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    return result;
  };

  /* =========================================================
     LOAD LESSONS

     قاعدة البيانات الحالية:

     lessons/{lessonId}

     وكل Lesson يحتوي على:

     gradeId
     subjectId
     unitId
     publicLessonId
     ========================================================= */

  useEffect(() => {
    if (!gradeId || !subjectId || !unitId) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const lessonsRef = collection(db, "lessons");

    /*
      نستخدم publicLessonId كـID ظاهر للرابط فقط.

      القراءة نفسها تتم من Top-Level lessons.
    */

    const q = query(
      lessonsRef,
      where("gradeId", "==", gradeId),
      where("subjectId", "==", subjectId),
      where("unitId", "==", unitId)
    );

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const lessonsData = snapshot.docs
            .map((d) => ({
              id: d.id,
              ...d.data(),
            }))
            .sort((a, b) => {
              const orderA = Number(a.order) || 0;
              const orderB = Number(b.order) || 0;

              return orderA - orderB;
            });

          /* =================================================
             LIVE CLASSES

             مهم:
             liveClassId يظل هو الـID الحقيقي للحصة
             ولا نغيره.
          ================================================= */

          let liveMap = {};

          try {
            const liveSnap = await getDocs(
              collection(db, "liveClasses")
            );

            liveSnap.forEach((liveDoc) => {
              const data = liveDoc.data();

              if (
                data.lessonId &&
                lessonsData.some(
                  (lesson) => lesson.id === data.lessonId
                )
              ) {
                liveMap[data.lessonId] = {
                  hasLive: true,
                  liveClassId: liveDoc.id,
                };
              }
            });
          } catch (liveError) {
            console.error(
              "Error loading live classes:",
              liveError
            );
          }

          /* =================================================
             MERGE
          ================================================= */

          const merged = lessonsData.map((lesson) => ({
            ...lesson,

            ...(liveMap[lesson.id] || {
              hasLive: false,
              liveClassId: null,
            }),
          }));

          setLessons(merged);
          setLoading(false);
        } catch (error) {
          console.error(
            "Error loading lessons:",
            error
          );

          setLessons([]);
          setLoading(false);
        }
      },
      (error) => {
        console.error(
          "Lessons listener error:",
          error
        );

        setLessons([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [
    gradeId,
    subjectId,
    unitId,
  ]);

  /* =========================================================
     ADD LESSON

     أي درس يتم إنشاؤه من هنا يحصل أيضًا على
     publicLessonId.

     الدرس الجديد يتم إنشاؤه في:

     lessons/{newLessonId}
  ========================================================= */

  const handleAddLesson = async () => {
    if (!canManageLessons) return;

    try {
      const lessonsRef = collection(
        db,
        "lessons"
      );

      const nextOrder =
        lessons.length > 0
          ? Math.max(
              ...lessons.map(
                (lesson) =>
                  Number(lesson.order) || 0
              )
            ) + 1
          : 1;

      /*
        التأكد من وجود Public ID غير مستخدم.
      */

      let publicLessonId = "";

      const existingPublicIds = new Set(
        lessons
          .map(
            (lesson) =>
              lesson.publicLessonId
          )
          .filter(Boolean)
      );

      do {
        publicLessonId =
          generatePublicLessonId();
      } while (
        existingPublicIds.has(
          publicLessonId
        )
      );

      await addDoc(
        lessonsRef,
        {
          title: getLessonTitle(
            subjectId,
            nextOrder
          ),

          order: nextOrder,

          publicLessonId,

          gradeId,
          subjectId,
          unitId,

          active: true,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(
        "Add lesson error:",
        error
      );

      alert(
        "حدث خطأ أثناء إضافة الدرس."
      );
    }
  };

  /* =========================================================
     DELETE LESSON

     الحذف يتم من:

     lessons/{lessonId}

     وليس من المسار القديم.
  ========================================================= */

  const handleDeleteLesson = async (
    lessonId
  ) => {
    const confirmDelete =
      window.confirm(
        "هل تريد حذف هذا الدرس؟"
      );

    if (!confirmDelete) return;

    if (!lessonId) return;

    try {
      const lessonRef = doc(
        db,
        "lessons",
        lessonId
      );

      await deleteDoc(
        lessonRef
      );
    } catch (err) {
      console.error(
        "Delete lesson error:",
        err
      );

      alert(
        "حدث خطأ أثناء حذف الدرس."
      );
    }
  };

  /* =========================================================
     DETECT STAGE
  ========================================================= */

  const detectStage = () => {
    const path =
      window.location.pathname;

    if (
      path.includes(
        "/primary-prep/"
      )
    ) {
      return "primary-prep";
    }

    if (
      path.includes(
        "/primary/"
      )
    ) {
      return "primary";
    }

    if (
      path.includes(
        "/preparatory/"
      )
    ) {
      return "preparatory";
    }

    if (
      path.includes(
        "/bac/"
      )
    ) {
      return "bac";
    }

    return "secondary";
  };

  /* =========================================================
     OPEN LESSON

     الطالب يستخدم publicLessonId في الرابط.

     الـFirestore document ID الحقيقي
     لا يظهر في الرابط.

     مثال:

     /student/secondary/lesson/sec1/history/unit-1/ABC123...
  ========================================================= */

  const openLesson = (
    lesson
  ) => {
    if (!lesson) return;

    const stage =
      detectStage();

    /*
      الدروس الجديدة والقديمة التي قمنا بعمل
      Migration لها لديها publicLessonId.

      الـfallback موجود فقط كحماية إضافية.
    */

    const publicId =
      lesson.publicLessonId ||
      lesson.id;

    if (!publicId) {
      alert(
        "تعذر فتح الدرس: Public Lesson ID غير موجود."
      );

      return;
    }

    navigate(
      `/student/${stage}/lesson/${gradeId}/${subjectId}/${unitId}/${publicId}`
    );
  };

  /* =========================================================
     OPEN LIVE

     لا نغير أي شيء هنا.

     الحصة المباشرة تستمر باستخدام
     liveClassId الحقيقي.
  ========================================================= */

  const openLive = (
    liveClassId
  ) => {
    if (!liveClassId) return;

    navigate(
      `/student-live/${liveClassId}`
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="lessons-container">
        Loading...
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="lessons-container">

      {/* ================= رجوع ================= */}

      <button
        className="back-btn"
        onClick={() =>
          navigate(-1)
        }
      >
        ← رجوع
      </button>

      {/* ================= العنوان ================= */}

      <h1 className="lessons-title">
        الدروس
      </h1>

      {/* ================= إضافة درس ================= */}

      {canManageLessons && (
        <button
          className="add-btn"
          onClick={
            handleAddLesson
          }
        >
          + إضافة درس
        </button>
      )}

      {/* ================= قائمة الدروس ================= */}

      <div className="lessons-grid">

        {lessons.map(
          (lesson, index) => (

            <div
              key={lesson.id}
              className="lesson-card"
            >

              {/* ================= فتح الدرس ================= */}

              <div
                onClick={() =>
                  openLesson(
                    lesson
                  )
                }
                style={{
                  cursor:
                    "pointer",
                }}
              >

                <div className="lesson-index-circle">
                  {index + 1}
                </div>

                <h3 className="lesson-title">
                  {lesson.title}
                </h3>

              </div>

              {/* ================= ACTIONS ================= */}

              <div className="lesson-actions">

                {/* ================= START ================= */}

                <button
                  className="lesson-start-btn"
                  onClick={() =>
                    openLesson(
                      lesson
                    )
                  }
                >
                  ▶ ابدأ
                </button>

                {/* ================= DELETE ================= */}

                {canManageLessons && (

                  <button
                    className="lesson-delete-btn"
                    onClick={() =>
                      handleDeleteLesson(
                        lesson.id
                      )
                    }
                  >
                    🗑 حذف الدرس
                  </button>

                )}

                {/* ================= LIVE ================= */}

                {lesson.hasLive && (

                  <button
                    className="lesson-start-btn"
                    style={{
                      marginTop:
                        "10px",
                      borderColor:
                        "#00ffd0",
                      color:
                        "#00ffd0",
                    }}
                    onClick={() =>
                      openLive(
                        lesson.liveClassId
                      )
                    }
                  >
                    🔴 دخول الحصة المباشرة
                  </button>

                )}

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}