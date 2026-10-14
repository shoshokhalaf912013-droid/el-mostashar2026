// src/routes/StudentRoutes.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import BacSubjectsRouter from "./BacSubjectsRouter";


/* =====================================================
   LAYOUTS
===================================================== */

import StudentLayout from "../layouts/StudentLayout";
import LiveLayout from "../layouts/LiveLayout";


/* =====================================================
   CONTEXTS
===================================================== */

import {
  SecondaryProvider,
} from "../contexts/SecondaryContext";


import {
  useAuth,
} from "../contexts/AuthContext";


/* =====================================================
   FIREBASE
===================================================== */

import {
  db,
} from "../firebase";


import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";


/* =====================================================
   GRADE GUARD
===================================================== */

import RequireGrade from "./RequireGrade";


/* =====================================================
   COMMON
===================================================== */

import StudentDashboard
  from "../pages/Student/StudentDashboard";

import SelectStage
  from "../pages/Student/SelectStage";

import StudentProfile
  from "../pages/Student/StudentProfile";


/* =====================================================
   EXAMS
===================================================== */

import ExamPage
  from "../pages/student/ExamPage";


/* =====================================================
   PRIMARY + PREP
===================================================== */

import SelectGrade
  from "../pages/Student/SelectGrade";

import PrimaryPrepSubjectsView
  from "../pages/Student/PrimaryPrep/PrimaryPrepSubjectsView";

import UnitsView
  from "../pages/Student/UnitsView";

import UnitsViewGeneral
  from "../pages/Student/UnitsViewGeneral";

import LessonsView
  from "../pages/Student/LessonsView";

import LessonPlayer
  from "../pages/Student/LessonPlayer";


/* =====================================================
   SECONDARY
===================================================== */

import SelectSecondarySystem
  from "../pages/Student/SelectSecondarySystem";

import SecondaryGradesView
  from "../pages/Student/Secondary/SecondaryGradesView";

import SecondarySubjectsView
  from "../pages/Student/Secondary/SecondarySubjectsView";

import SecondaryAdvancedSubjectsView
  from "../pages/Student/Secondary/SecondaryAdvancedSubjectsView";


/* =====================================================
   BAC
===================================================== */

import BacGradesView
  from "../pages/Student/Bac/BacGradesView";

import BacUnitsView
  from "../pages/Student/Bac/BacUnitsView";


/* =====================================================
   LIVE
===================================================== */

import StudentLiveRoomWrapper
  from "../features/liveClass/StudentLiveRoomWrapper";

import TestLiveRoom
  from "../live/pages/TestLiveRoom";


/* =====================================================
   SUBSCRIPTION GUARD
===================================================== */

function RequireSubscription({
  children,
}) {

  const {
    user,
    role,
    loading: authLoading,
  } = useAuth();


  const params =
    useParams();


  const [checking, setChecking] =
    useState(true);


  const [allowed, setAllowed] =
    useState(false);


  const [errorType, setErrorType] =
    useState("");


  const [studentData, setStudentData] =
    useState(null);


  /* ===================================================
     CHECK
  =================================================== */

  useEffect(() => {

    if (authLoading) {
      return;
    }

    checkSubscription();

  }, [
    authLoading,
    user,
    role,
    params.gradeId,
    params.subjectId,
  ]);


  /* ===================================================
     CHECK SUBSCRIPTION FUNCTION
  =================================================== */

  async function checkSubscription() {

    setChecking(true);

    setAllowed(false);

    setErrorType("");

    setStudentData(null);


    /* =================================================
       LOGIN
    ================================================= */

    if (!user?.uid) {

      setErrorType("login");

      setChecking(false);

      return;
    }


    /* =================================================
       ROLE
    ================================================= */

    const normalizedRole =
      String(role || "")
        .toLowerCase();


    /* =================================================
       STAFF
    ================================================= */

    const isStaff =
      normalizedRole === "admin" ||
      normalizedRole === "teacher" ||
      normalizedRole === "super-admin" ||
      normalizedRole === "superadmin";


    if (isStaff) {

      setAllowed(true);

      setChecking(false);

      return;
    }


    /* =================================================
       STUDENT
    ================================================= */

    if (
      normalizedRole !== "student"
    ) {

      setErrorType(
        "subscription"
      );

      setChecking(false);

      return;
    }


    try {

      /* ===============================================
         USER DOCUMENT
      =============================================== */

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const snap =
        await getDoc(userRef);


      if (!snap.exists()) {

        setErrorType(
          "subscription"
        );

        setChecking(false);

        return;
      }


      const data =
        snap.data();


      setStudentData(data);


      /* ===============================================
         STATUS
      =============================================== */

      if (
        data.status !== "active"
      ) {

        setErrorType(
          "not-active"
        );

        setChecking(false);

        return;
      }


      /* ===============================================
         GRADE
      =============================================== */

      const requestedGrade =
        params.gradeId ||
        null;


      /*
       * =================================================
       * الصف الأول: الثانوية العامة والبكالوريا
       *
       * sec1 و bac1 يستخدمان نفس منهج الصف الأول.
       * لذلك التسجيل في أحدهما يكفي للوصول إلى الآخر.
       *
       * لا نغيّر gradeId في Firebase ولا ننشئ
       * تسجيلًا ثانيًا؛ نسمح فقط بالمطابقة بينهما
       * داخل فحص الصلاحية.
       * =================================================
       */
      const gradesAreEquivalent =
        (data.gradeId === "sec1" && requestedGrade === "bac1") ||
        (data.gradeId === "bac1" && requestedGrade === "sec1");


      if (
        requestedGrade &&
        data.gradeId !== requestedGrade &&
        !gradesAreEquivalent
      ) {

        setErrorType(
          "wrong-grade"
        );

        setChecking(false);

        return;
      }


      /* ===============================================
         SUBJECT
      =============================================== */

      const requestedSubject =
        params.subjectId ||
        null;


      if (
        requestedSubject &&
        data.subjectId !== requestedSubject
      ) {

        setErrorType(
          "wrong-subject"
        );

        setChecking(false);

        return;
      }


      /* ===============================================
         ALLOWED
      =============================================== */

      setAllowed(true);

    } catch (error) {

      console.error(
        "Subscription check error:",
        error
      );

      setErrorType(
        "error"
      );

    } finally {

      setChecking(false);

    }

  }


  /* ===================================================
     LOADING
  =================================================== */

  if (
    authLoading ||
    checking
  ) {

    return (

      <div
        dir="rtl"
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <div
            className="
              text-4xl
              mb-4
            "
          >
            ⏳
          </div>

          <div
            className="
              text-yellow-400
              text-xl
              font-bold
            "
          >
            جاري التحقق من الاشتراك...
          </div>

        </div>

      </div>

    );

  }


  /* ===================================================
     LOGIN REQUIRED
  =================================================== */

  if (
    errorType === "login"
  ) {

    return (

      <div
        dir="rtl"
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          p-6
        "
      >

        <div
          className="
            max-w-lg
            w-full
            bg-zinc-900
            border
            border-yellow-500
            rounded-2xl
            p-8
            text-center
          "
        >

          <div className="text-6xl mb-5">
            🔒
          </div>


          <h2
            className="
              text-2xl
              font-bold
              text-yellow-400
              mb-4
            "
          >
            يجب تسجيل الدخول
          </h2>


          <p
            className="
              text-gray-300
              leading-8
              mb-6
            "
          >
            يرجى تسجيل الدخول للوصول
            إلى المحتوى التعليمي.
          </p>


          <button
            onClick={() => {
              window.location.href =
                "/login";
            }}
            className="
              bg-yellow-500
              text-black
              font-bold
              px-8
              py-3
              rounded-xl
            "
          >
            تسجيل الدخول
          </button>

        </div>

      </div>

    );

  }


  /* ===================================================
     NOT ACTIVE
  =================================================== */

  if (
    errorType === "not-active" ||
    errorType === "subscription"
  ) {

    const studentName =
      studentData?.fullName ||
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "";


    const whatsappMessage =
      encodeURIComponent(
        `مرحبًا، أريد تفعيل اشتراكي في منصة المستشار 2027.

الاسم: ${studentName}

أرسلت قيمة الاشتراك على رقم:
01012002317

فودافون كاش / InstaPay

وهذا إيصال الدفع لتفعيل اشتراكي.`
      );


    const whatsappUrl =
      `https://wa.me/201012002317?text=${whatsappMessage}`;


    return (

      <div
        dir="rtl"
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          p-6
        "
      >

        <div
          className="
            max-w-lg
            w-full
            bg-zinc-900
            border
            border-yellow-500
            rounded-2xl
            p-8
            text-center
            shadow-2xl
          "
        >

          <div
            className="
              text-6xl
              mb-5
            "
          >
            🔒
          </div>


          <h2
            className="
              text-3xl
              font-bold
              text-yellow-400
              mb-4
            "
          >
            أنت غير مشترك
          </h2>


          <p
            className="
              text-gray-200
              text-lg
              leading-8
              mb-5
            "
          >
            لا يمكنك فتح هذا المحتوى حاليًا.
          </p>


          <div
            className="
              bg-black
              border
              border-yellow-500
              rounded-xl
              p-5
              mb-5
            "
          >

            <p className="text-gray-300 mb-3">
              💳 للاشتراك، يرجى تحويل قيمة
              الاشتراك على:
            </p>


            <p
              dir="ltr"
              className="
                text-yellow-400
                text-3xl
                font-bold
                tracking-wider
                mb-3
              "
            >
              01012002317
            </p>


            <p
              className="
                text-white
                font-semibold
                text-lg
              "
            >
              فودافون كاش / InstaPay
            </p>

          </div>


          <p
            className="
              text-gray-300
              leading-8
              mb-5
            "
          >
            بعد إتمام التحويل، أرسل صورة
            إيصال الدفع لتفعيل اشتراكك.
          </p>


          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block
              w-full
              bg-green-600
              hover:bg-green-500
              text-white
              font-bold
              py-4
              rounded-xl
              transition
              mb-4
            "
          >
            📱 إرسال إيصال الدفع عبر واتساب
          </a>


          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="
              w-full
              bg-yellow-500
              hover:bg-yellow-400
              text-black
              font-bold
              py-3
              rounded-xl
            "
          >
            العودة للرئيسية
          </button>

        </div>

      </div>

    );

  }


  /* ===================================================
     WRONG GRADE
  =================================================== */

  if (
    errorType === "wrong-grade"
  ) {

    return (

      <div
        dir="rtl"
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          p-6
        "
      >

        <div
          className="
            max-w-lg
            w-full
            bg-zinc-900
            border
            border-yellow-500
            rounded-2xl
            p-8
            text-center
          "
        >

          <div className="text-6xl mb-5">
            🔒
          </div>


          <h2
            className="
              text-2xl
              font-bold
              text-yellow-400
              mb-4
            "
          >
            هذا الصف غير متاح لاشتراكك
          </h2>


          <p
            className="
              text-gray-300
              leading-8
            "
          >
            أنت مشترك في صف دراسي مختلف.
            <br />
            لا يمكنك فتح محتوى هذا الصف.
          </p>


          <p
            dir="ltr"
            className="
              text-yellow-400
              text-xl
              font-bold
              mt-6
            "
          >
            01012002317
          </p>

        </div>

      </div>

    );

  }


  /* ===================================================
     WRONG SUBJECT
  =================================================== */

  if (
    errorType === "wrong-subject"
  ) {

    const whatsappUrl =
      `https://wa.me/201012002317?text=${encodeURIComponent(
        "مرحبًا، أريد الاشتراك في مادة أخرى على منصة المستشار 2027."
      )}`;


    return (

      <div
        dir="rtl"
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          p-6
        "
      >

        <div
          className="
            max-w-lg
            w-full
            bg-zinc-900
            border
            border-yellow-500
            rounded-2xl
            p-8
            text-center
          "
        >

          <div className="text-6xl mb-5">
            🔒
          </div>


          <h2
            className="
              text-2xl
              font-bold
              text-yellow-400
              mb-4
            "
          >
            أنت غير مشترك في هذه المادة
          </h2>


          <p
            className="
              text-gray-300
              leading-8
              mb-6
            "
          >
            المادة التي تحاول فتحها ليست
            ضمن اشتراكك الحالي.
          </p>


          <div
            className="
              bg-black
              border
              border-yellow-500
              rounded-xl
              p-5
              mb-5
            "
          >

            <p className="text-gray-300 mb-2">
              💳 للاشتراك:
            </p>


            <p
              dir="ltr"
              className="
                text-yellow-400
                text-2xl
                font-bold
                mb-2
              "
            >
              01012002317
            </p>


            <p>
              فودافون كاش / InstaPay
            </p>

          </div>


          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block
              w-full
              bg-green-600
              hover:bg-green-500
              text-white
              font-bold
              py-4
              rounded-xl
              mb-4
            "
          >
            📱 إرسال إيصال الدفع
          </a>


          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="
              w-full
              bg-yellow-500
              text-black
              font-bold
              py-3
              rounded-xl
            "
          >
            العودة للرئيسية
          </button>

        </div>

      </div>

    );

  }


  /* ===================================================
     ERROR
  =================================================== */

  if (
    errorType === "error"
  ) {

    return (

      <div
        dir="rtl"
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          p-6
        "
      >

        <div
          className="
            bg-zinc-900
            border
            border-red-500
            rounded-2xl
            p-8
            text-center
          "
        >

          <div className="text-5xl mb-4">
            ⚠️
          </div>


          <h2
            className="
              text-2xl
              font-bold
              text-red-400
              mb-4
            "
          >
            تعذر التحقق من الاشتراك
          </h2>


          <p className="text-gray-300">
            حدث خطأ أثناء التحقق من بيانات
            الاشتراك.
          </p>

        </div>

      </div>

    );

  }


  /* ===================================================
     ALLOWED
  =================================================== */

  if (allowed) {

    return children;

  }


  return null;

}


/* =========================================================
   PUBLIC LESSON ID RESOLVER

   The URL exposes only publicLessonId.
   Internally, we resolve it to the real top-level lesson document ID.
   This does NOT change the lesson data itself.
========================================================= */
function PublicLessonResolver({ children }) {

  const {
    gradeId,
    subjectId,
    unitId,
    publicLessonId,
  } = useParams();

  const [loading, setLoading] = useState(true);
  const [resolvedLessonId, setResolvedLessonId] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {

    let cancelled = false;

    const resolveLesson = async () => {

      setLoading(true);
      setResolvedLessonId("");
      setNotFound(false);

      if (!gradeId || !subjectId || !unitId || !publicLessonId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {

        // Current database structure: lessons/{realLessonId}
        // Search only by publicLessonId, then verify the route context locally.
        const lessonsRef = collection(db, "lessons");

        const q = query(
          lessonsRef,
          where("publicLessonId", "==", publicLessonId)
        );

        const snap = await getDocs(q);

        if (cancelled) return;

        if (snap.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const matchingDoc = snap.docs.find((lessonDoc) => {
          const data = lessonDoc.data() || {};

          return (
            data.gradeId === gradeId &&
            data.subjectId === subjectId &&
            data.unitId === unitId
          );
        });

        if (!matchingDoc) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setResolvedLessonId(matchingDoc.id);
        setLoading(false);

      } catch (error) {

        console.error(
          "Public lesson ID resolution error:",
          error
        );

        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    resolveLesson();

    return () => {
      cancelled = true;
    };

  }, [
    gradeId,
    subjectId,
    unitId,
    publicLessonId,
  ]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-black text-white flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-yellow-400 text-xl font-bold">
            جاري فتح الدرس...
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !resolvedLessonId) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-black text-white flex items-center justify-center p-6"
      >
        <div className="max-w-lg w-full bg-zinc-900 border border-red-500 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            الدرس غير موجود
          </h2>
          <p className="text-gray-300 leading-8">
            تعذر العثور على هذا الدرس.
          </p>
        </div>
      </div>
    );
  }

  return children(resolvedLessonId);
}


/* =========================================================
   STUDENT ROUTES
========================================================= */

export default function StudentRoutes() {

  return (

    <SecondaryProvider>

      <Routes>

        <Route
          element={
            <StudentLayout />
          }
        >

          {/* ================= DASHBOARD ================= */}

          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />


          <Route
            path="dashboard"
            element={
              <StudentDashboard />
            }
          />


          <Route
            path="profile"
            element={
              <StudentProfile />
            }
          />


          <Route
            path="select-stage"
            element={
              <SelectStage />
            }
          />


          {/* ================= EXAM ================= */}

          <Route
            path="exam/:id"
            element={
              <ExamPage />
            }
          />


          {/* ================= PRIMARY ================= */}

          <Route
            path="primary-prep/select-grade/:stageId"
            element={
              <SelectGrade />
            }
          />


          <Route
            path="primary/select-grade/:stageId"
            element={
              <SelectGrade />
            }
          />


          <Route
            path="preparatory/select-grade/:stageId"
            element={
              <SelectGrade />
            }
          />


          <Route
            path="primary-prep/subjects/:gradeId"
            element={
              <RequireGrade>
                <PrimaryPrepSubjectsView />
              </RequireGrade>
            }
          />


          <Route
            path="primary/subjects/:gradeId"
            element={
              <RequireGrade>
                <PrimaryPrepSubjectsView />
              </RequireGrade>
            }
          />


          <Route
            path="preparatory/subjects/:gradeId"
            element={
              <RequireGrade>
                <PrimaryPrepSubjectsView />
              </RequireGrade>
            }
          />


          <Route
            path="primary-prep/units/:gradeId/:subjectId"
            element={
              <RequireGrade>
                <UnitsViewGeneral />
              </RequireGrade>
            }
          />


          <Route
            path="primary/units/:gradeId/:subjectId"
            element={
              <RequireGrade>
                <UnitsViewGeneral />
              </RequireGrade>
            }
          />


          <Route
            path="preparatory/units/:gradeId/:subjectId"
            element={
              <RequireGrade>
                <UnitsViewGeneral />
              </RequireGrade>
            }
          />


          <Route
            path="primary-prep/lessons/:gradeId/:subjectId/:unitId"
            element={
              <RequireGrade>
                <LessonsView />
              </RequireGrade>
            }
          />


          <Route
            path="primary/lessons/:gradeId/:subjectId/:unitId"
            element={
              <RequireGrade>
                <LessonsView />
              </RequireGrade>
            }
          />


          <Route
            path="preparatory/lessons/:gradeId/:subjectId/:unitId"
            element={
              <RequireGrade>
                <LessonsView />
              </RequireGrade>
            }
          />


          <Route
            path="primary-prep/lesson/:gradeId/:subjectId/:unitId/:publicLessonId"
            element={
              <RequireGrade>
                <PublicLessonResolver>
                  {(resolvedLessonId) => (
                    <LessonPlayer resolvedLessonId={resolvedLessonId} />
                  )}
                </PublicLessonResolver>
              </RequireGrade>
            }
          />


          <Route
            path="primary/lesson/:gradeId/:subjectId/:unitId/:publicLessonId"
            element={
              <RequireGrade>
                <PublicLessonResolver>
                  {(resolvedLessonId) => (
                    <LessonPlayer resolvedLessonId={resolvedLessonId} />
                  )}
                </PublicLessonResolver>
              </RequireGrade>
            }
          />


          <Route
            path="preparatory/lesson/:gradeId/:subjectId/:unitId/:publicLessonId"
            element={
              <RequireGrade>
                <PublicLessonResolver>
                  {(resolvedLessonId) => (
                    <LessonPlayer resolvedLessonId={resolvedLessonId} />
                  )}
                </PublicLessonResolver>
              </RequireGrade>
            }
          />


          {/* ================= SECONDARY ================= */}

          <Route
            path="secondary"
            element={
              <SelectSecondarySystem />
            }
          />


          <Route
            path="secondary/grades"
            element={
              <SecondaryGradesView />
            }
          />


          {/* =================================================
             الثانوية العامة - المواد
          ================================================= */}

          <Route
            path="secondary/subjects/sec1"
            element={
              <RequireSubscription>
                <SecondarySubjectsView />
              </RequireSubscription>
            }
          />


          <Route
            path="secondary/advanced-subjects/:gradeId"
            element={
              <RequireSubscription>
                <SecondaryAdvancedSubjectsView />
              </RequireSubscription>
            }
          />


          {/* =================================================
             الثانوية العامة - الوحدات
             
             هنا subjectId موجود،
             ولذلك يتم منع المادة غير المشتركة.
          ================================================= */}

          <Route
            path="secondary/units/:gradeId/:subjectId"
            element={
              <RequireSubscription>
                <UnitsView />
              </RequireSubscription>
            }
          />


          {/* ================= SECONDARY LESSONS ================= */}

          <Route
            path="secondary/lessons/:gradeId/:subjectId/:unitId"
            element={
              <RequireSubscription>
                <LessonsView />
              </RequireSubscription>
            }
          />


          <Route
            path="secondary/lesson/:gradeId/:subjectId/:unitId/:publicLessonId"
            element={
              <RequireSubscription>
                <PublicLessonResolver>
                  {(resolvedLessonId) => (
                    <LessonPlayer resolvedLessonId={resolvedLessonId} />
                  )}
                </PublicLessonResolver>
              </RequireSubscription>
            }
          />


          {/* ================= BAC ================= */}

          <Route
            path="bac/grades"
            element={
              <BacGradesView />
            }
          />


          <Route
            path="bac/subjects/:gradeId"
            element={
              <RequireSubscription>
                <BacSubjectsRouter />
              </RequireSubscription>
            }
          />


          <Route
            path="bac/units/:gradeId/:subjectId"
            element={
              <RequireSubscription>
                <BacUnitsView />
              </RequireSubscription>
            }
          />


          <Route
            path="bac/lessons/:gradeId/:subjectId/:unitId"
            element={
              <RequireSubscription>
                <LessonsView />
              </RequireSubscription>
            }
          />


          <Route
            path="bac/lesson/:gradeId/:subjectId/:unitId/:publicLessonId"
            element={
              <RequireSubscription>
                <PublicLessonResolver>
                  {(resolvedLessonId) => (
                    <LessonPlayer resolvedLessonId={resolvedLessonId} />
                  )}
                </PublicLessonResolver>
              </RequireSubscription>
            }
          />

        </Route>


        {/* ===================================================
           LIVE
        =================================================== */}

        <Route
          element={
            <LiveLayout />
          }
        >

          <Route
            path="live/:gradeId/:subjectId/:unitId/:lessonId"
            element={
              <StudentLiveRoomWrapper />
            }
          />


          <Route
            path="student/live/:gradeId/:subjectId/:unitId/:lessonId"
            element={
              <StudentLiveRoomWrapper />
            }
          />


          <Route
            path="primary-prep/live/:gradeId/:subjectId/:unitId/:lessonId"
            element={
              <StudentLiveRoomWrapper />
            }
          />


          <Route
            path="student-live/:lessonId"
            element={
              <StudentLiveRoomWrapper />
            }
          />


          <Route
            path="live-test"
            element={
              <TestLiveRoom />
            }
          />

        </Route>

      </Routes>

    </SecondaryProvider>

  );

}
