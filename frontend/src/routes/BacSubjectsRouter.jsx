import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import BacAdvancedSubjectsView from "../pages/Student/Bac/BacAdvancedSubjectsView";

export default function BacSubjectsRouter() {
  const { gradeId } = useParams();

  console.log("=================================");
  console.log("[BAC ROUTER] LOADED");
  console.log("[BAC ROUTER] gradeId =", gradeId);
  console.log("[BAC ROUTER] URL =", window.location.pathname);
  console.log("=================================");

  /*
   * ============================================================
   * BAC 1
   *
   * الصف الأول بكالوريا يستخدم مواد الصف الأول الثانوي العام.
   *
   * لذلك لا نستخدم:
   * BacSubjectsView
   * ولا:
   * BacUnitsView
   *
   * وإنما نقرأ مواد:
   *
   * stageId = secondary
   * gradeId = sec1
   *
   * ثم نفتح الوحدات من مسار الثانوية العامة.
   * ============================================================
   */

  if (gradeId === "bac1") {
    return <BacFirstYearSubjects />;
  }

  /*
   * ============================================================
   * BAC 2 / BAC 3
   *
   * هذه هي المسارات المتقدمة.
   * ============================================================
   */

  if (gradeId === "bac2" || gradeId === "bac3") {
    console.log("[BAC ROUTER] ADVANCED -> BacAdvancedSubjectsView");

    return <BacAdvancedSubjectsView />;
  }

  /*
   * ============================================================
   * أي gradeId غير معروف
   * ============================================================
   */

  console.error("[BAC ROUTER] UNKNOWN gradeId =", gradeId);

  return (
    <Navigate
      to="/student/bac/grades"
      replace
    />
  );
}


/* ================================================================
   BAC 1 SUBJECTS

   مصدر المواد:
   gradeSubjects

   المرحلة:
   secondary

   الصف:
   sec1

   المواد المطلوبة:
   التاريخ
   الجغرافيا

   روابط المواد:
   /student/secondary/units/sec1/history
   /student/secondary/units/sec1/geography
   ================================================================ */

function BacFirstYearSubjects() {

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadSubjects() {

      console.log("=================================");
      console.log("[BAC1] Loading secondary subjects");
      console.log("[BAC1] stageId = secondary");
      console.log("[BAC1] gradeId = sec1");
      console.log("=================================");

      setLoading(true);

      try {

        const q = query(
          collection(db, "gradeSubjects"),

          where(
            "active",
            "==",
            true
          ),

          where(
            "stageId",
            "==",
            "secondary"
          ),

          where(
            "gradeId",
            "==",
            "sec1"
          )
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((subject) => {

            const title =
              subject.title?.trim() || "";

            return (
              title === "التاريخ" ||
              title === "الجغرافيا"
            );
          })
          .sort(
            (a, b) =>
              (a.order ?? 0) -
              (b.order ?? 0)
          );

        console.log(
          "[BAC1] SECONDARY SUBJECTS =",
          data
        );

        setSubjects(data);

      } catch (error) {

        console.error(
          "[BAC1] ERROR LOADING SUBJECTS:",
          error
        );

        setSubjects([]);

      } finally {

        setLoading(false);

      }
    }

    loadSubjects();

  }, []);


  /* =========================
     LOADING
     ========================= */

  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">

        <div className="text-xl text-yellow-400">
          جاري تحميل المواد...
        </div>

      </div>
    );
  }


  /* =========================
     NO SUBJECTS
     ========================= */

  if (!subjects.length) {

    return (
      <div className="min-h-screen bg-black text-white p-10">

        <div className="max-w-4xl mx-auto">

          <h1 className="text-2xl font-bold text-yellow-400 text-center mb-10">
            المواد
          </h1>

          <div className="text-center text-red-400 text-xl">
            لا توجد مواد للصف الأول الثانوي
          </div>

        </div>

      </div>
    );
  }


  /* =========================
     SUBJECT CARD
     ========================= */

  function renderSubject(subject) {

    /*
     * subjectId الموجود في gradeSubjects
     * يجب أن يكون:
     *
     * history
     * geography
     *
     * وهو الذي سنستخدمه في مسار الثانوية.
     */

    const subjectId =
      subject.subjectId ||
      subject.id;

    return (
      <Link
        key={subject.id}
        to={`/student/secondary/units/sec1/${subjectId}`}
        className="
          block
          bg-zinc-900
          rounded-xl
          p-8
          text-center
          border
          border-yellow-700/40
          hover:border-yellow-400
          hover:shadow-[0_0_18px_rgba(255,215,0,0.35)]
          transition
        "
      >

        <div className="text-xl text-yellow-200 font-semibold">
          {subject.title}
        </div>

      </Link>
    );
  }


  /* =========================
     FINAL UI
     ========================= */

  return (
    <div
      className="
        min-h-screen
        bg-black
        text-white
        p-10
      "
    >

      <div className="max-w-5xl mx-auto">

        <h1
          className="
            text-2xl
            font-bold
            text-yellow-400
            text-center
            mb-10
          "
        >
          مواد الصف الأول بكالوريا
        </h1>


        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          "
        >

          {subjects.map(renderSubject)}

        </div>

      </div>

    </div>
  );
}