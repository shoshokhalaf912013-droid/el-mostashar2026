import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import LessonsSidebar from "./LessonsSidebar";

export default function StudentSubjectLessons() {
  // ✅ مطابق تمامًا للـ Route
  const { gradeKey, subjectKey } = useParams();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gradeKey || !subjectKey) {
      console.error("❌ Missing params:", { gradeKey, subjectKey });
      setLoading(false);
      return;
    }

    const loadUnits = async () => {
      try {
        setLoading(true);

        const unitsRef = collection(
          db,
          "subjectsByGrade",
          gradeKey,
          subjectKey,
          "units"
        );

        const unitsSnap = await getDocs(
          query(unitsRef, orderBy("order"))
        );

        const unitsData = [];

        for (const unitDoc of unitsSnap.docs) {
          const lessonsRef = collection(
            db,
            "subjectsByGrade",
            gradeKey,
            subjectKey,
            "units",
            unitDoc.id,
            "lessons"
          );

          const lessonsSnap = await getDocs(
            query(lessonsRef, orderBy("order"))
          );

          unitsData.push({
            id: unitDoc.id,
            title: unitDoc.data().title,
            lessons: lessonsSnap.docs.map((l) => ({
              id: l.id,
              ...l.data(),
            })),
          });
        }

        setUnits(unitsData);
      } catch (e) {
        console.error("❌ Failed to load units:", e);
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [gradeKey, subjectKey]);

  if (loading) {
    return (
      <div className="text-center text-yellow-400 mt-20">
        ⏳ جاري تحميل المحتوى...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white" dir="rtl">
      <LessonsSidebar units={units} />

      <main className="flex-1 p-8">
        <div className="text-center text-gray-400 mt-20">
          اختر درسًا من القائمة
        </div>
      </main>
    </div>
  );
}
