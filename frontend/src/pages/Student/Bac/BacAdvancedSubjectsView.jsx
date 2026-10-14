import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase";

export default function BacAdvancedSubjectsView() {
  const { gradeId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, [gradeId]);

  async function loadSubjects() {
    setLoading(true);

    try {
      let selectedSubjects = [];

      /* =====================================================
         BAC 1
         نفس مادة التاريخ الموجودة في الصف الأول الثانوي العام
         sec1
      ===================================================== */

      if (gradeId === "bac1") {
        const q = query(
          collection(db, "gradeSubjects"),
          where("active", "==", true),
          where("stageId", "==", "secondary"),
          where("gradeId", "==", "sec1")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((subject) => {
            const title = subject.title?.trim();

            return title === "التاريخ";
          })
          .sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0)
          );

        selectedSubjects = data;
      }

      /* =====================================================
         BAC 2
         التاريخ الوطني الخاص بالبكالوريا
      ===================================================== */

      if (gradeId === "bac2") {
        const q = query(
          collection(db, "gradeSubjects"),
          where("active", "==", true),
          where("gradeId", "==", "bac2")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((subject) => {
            const subjectId = String(
              subject.subjectId || ""
            )
              .trim()
              .toLowerCase();

            const title = String(
              subject.title || ""
            ).trim();

            const nameAr = String(
              subject.nameAr || ""
            ).trim();

            return (
              subjectId === "national history" ||
              subjectId === "national-history" ||
              title === "التاريخ الوطني" ||
              nameAr === "التاريخ الوطني"
            );
          })
          .sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0)
          );

        selectedSubjects = data;
      }

      /* =====================================================
         BAC 3
         الاقتصاد + الجغرافيا
      ===================================================== */

      if (gradeId === "bac3") {
        const q = query(
          collection(db, "trackSubjects"),
          where("active", "==", true),
          where("gradeId", "==", "bac3")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((subject) => {
            const subjectId = String(
              subject.subjectId || ""
            )
              .trim()
              .toLowerCase();

            return (
              subjectId === "economics" ||
              subjectId === "geography"
            );
          })
          .sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0)
          );

        selectedSubjects = data;
      }

      console.log(
        `[BAC] ${gradeId} FINAL SUBJECTS:`,
        selectedSubjects
      );

      setSubjects(selectedSubjects);
    } catch (error) {
      console.error(
        `[BAC] Error loading subjects for ${gradeId}:`,
        error
      );

      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     فتح المادة
     
     مهم جدًا:
     bac1 يستخدم نفس subjectId الموجود في sec1
     وبالتالي يفتح نفس وحدات التاريخ الخاصة بالثانوي العام.
  ===================================================== */

  const goToUnits = (subject) => {
    const subjectId =
      subject.subjectId || subject.id;

    console.log(
      "[BAC] Opening subject:",
      subjectId
    );

    navigate(
      `/student/bac/units/${gradeId}/${subjectId}`
    );
  };

  /* =====================================================
     Loading
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-yellow-400 text-xl">
          جاري التحميل...
        </div>
      </div>
    );
  }

  /* =====================================================
     No subjects
  ===================================================== */

  if (!subjects.length) {
    return (
      <div className="min-h-screen bg-black text-white p-10">
        <div className="text-center text-red-400 text-xl">
          لا توجد مادة متاحة لهذا الصف
        </div>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-2xl font-bold text-yellow-400 text-center mb-10">
        {gradeId === "bac1"
          ? "مواد الصف الأول بالبكالوريا"
          : gradeId === "bac2"
          ? "مواد الصف الثاني بالبكالوريا"
          : "مواد الصف الثالث بالبكالوريا"}
      </h1>

      <div className="max-w-4xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {subjects.map((subject) => {
            const subjectId =
              subject.subjectId || subject.id;

            let title = "";

            if (gradeId === "bac1") {
              title = "التاريخ";
            } else if (gradeId === "bac2") {
              title =
                subject.title ||
                subject.nameAr ||
                "التاريخ الوطني";
            } else if (
              String(subjectId)
                .trim()
                .toLowerCase() === "economics"
            ) {
              title = "الاقتصاد";
            } else if (
              String(subjectId)
                .trim()
                .toLowerCase() === "geography"
            ) {
              title = "الجغرافيا";
            } else {
              title =
                subject.title ||
                subject.nameAr ||
                subjectId;
            }

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => goToUnits(subject)}
                className="
                  block
                  w-full
                  min-h-[80px]
                  cursor-pointer
                  bg-zinc-900
                  rounded-xl
                  p-8
                  text-center
                  border
                  border-yellow-700/40
                  text-yellow-200
                  font-semibold
                  hover:border-yellow-400
                  hover:shadow-[0_0_18px_rgba(255,215,0,0.35)]
                  transition
                "
              >
                {title}
              </button>
            );
          })}

        </div>

      </div>
    </div>
  );
}