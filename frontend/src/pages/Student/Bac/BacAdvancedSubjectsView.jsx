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

  /* =====================================================
     تحميل المواد عند تغيير الصف
  ===================================================== */

  useEffect(() => {
    loadSubjects();
  }, [gradeId]);

  /* =====================================================
     تحميل المواد
  ===================================================== */

  async function loadSubjects() {
    setLoading(true);

    try {
      /* ===================================================
         تحديد مصدر المواد العامة

         bac2:
         له الآن مادة عامة خاصة به:
         National History

         bac3:
         المواد العامة يمكن أن تستمر في الوراثة
         من sec3 كما كان النظام الأصلي.
      =================================================== */

      const sourceGradeId =
        gradeId === "bac3"
          ? "sec3"
          : gradeId;

      /* ===================================================
         المواد العامة
      =================================================== */

      const generalQ = query(
        collection(db, "gradeSubjects"),
        where("gradeId", "==", sourceGradeId),
        where("active", "==", true),
        orderBy("order", "asc")
      );

      const generalSnap = await getDocs(generalQ);

      const generalSubjects = generalSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      /* ===================================================
         مواد المسارات

         لا نحذفها ولا ننقلها.
         ستظل موجودة لاستخدام النسخة الشاملة.
      =================================================== */

      const trackQ = query(
        collection(db, "trackSubjects"),
        where("gradeId", "==", gradeId),
        where("active", "==", true),
        orderBy("order", "asc")
      );

      const trackSnap = await getDocs(trackQ);

      const trackSubjects = trackSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      /* ===================================================
         تحديد المواد التي تظهر في النسخة الحالية
      =================================================== */

      let selectedSubjects = [];

      /* ===================================================
         الصف الثاني بكالوريا

         لا يرث history من sec2.

         يستخدم المادة العامة الخاصة بالبكالوريا:

         subjectId = National History
      =================================================== */

      if (gradeId === "bac2") {
        selectedSubjects = generalSubjects.filter(
          (subject) =>
            subject.subjectId === "National History"
        );
      }

      /* ===================================================
         الصف الثالث بكالوريا

         النسخة الحالية تستخدم:

         1. الاقتصاد
         2. الجغرافيا

         كلاهما موجود في trackSubjects
         وكل مادة تحتفظ بـ trackId الخاص بها.

         لا نقوم بنقلها إلى gradeSubjects.
         ولا نحذف بقية مواد المسارات.
      =================================================== */

      if (gradeId === "bac3") {
        const economySubjects = trackSubjects.filter(
          (subject) =>
            subject.subjectId === "economics"
        );

        const geographySubjects = trackSubjects.filter(
          (subject) =>
            subject.subjectId === "geography"
        );

        selectedSubjects = [
          ...economySubjects,
          ...geographySubjects,
        ];
      }

      /* ===================================================
         منع التكرار

         نستخدم subjectId كمفتاح للمادة.
      =================================================== */

      const uniqueSubjects = Array.from(
        new Map(
          selectedSubjects.map((subject) => [
            subject.subjectId,
            subject,
          ])
        ).values()
      );

      /* ===================================================
         ترتيب المواد

         نحافظ على order الموجود في Firebase.
      =================================================== */

      uniqueSubjects.sort(
        (a, b) =>
          (a.order || 0) - (b.order || 0)
      );

      setSubjects(uniqueSubjects);

    } catch (error) {
      console.error(
        "❌ Error loading Bac subjects:",
        error
      );

      setSubjects([]);

    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     الانتقال إلى الوحدات
  ===================================================== */

  const goToUnits = (subject) => {
    navigate(
      `/student/bac/units/${gradeId}/${subject.subjectId}`
    );
  };

  /* =====================================================
     Loading
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">
          جاري التحميل...
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
        {gradeId === "bac2"
          ? "مواد الصف الثاني بالبكالوريا"
          : "مواد الصف الثالث بالبكالوريا"}
      </h1>

      {subjects.length > 0 ? (
        <div className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => goToUnits(subject)}
                className="
                  cursor-pointer
                  rounded-xl
                  px-6
                  py-5
                  text-center
                  border
                  border-yellow-500
                  text-yellow-400
                  bg-zinc-900
                  transition-all
                  duration-200
                  hover:bg-yellow-400
                  hover:text-black
                  hover:scale-[1.02]
                "
              >
                {subject.title ||
                  subject.nameAr ||
                  (
                    subject.subjectId === "National History"
                      ? "التاريخ الوطنى"
                      : subject.subjectId === "economics"
                      ? "الاقتصاد"
                      : subject.subjectId === "geography"
                      ? "الجغرافيا"
                      : subject.subjectId
                  )}
              </button>
            ))}

          </div>

        </div>
      ) : (
        <div className="text-center text-red-400 text-xl">
          لا توجد مادة متاحة لهذا الصف
        </div>
      )}

    </div>
  );
}