import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "../../../firebase";

import AddLessonModal from "./AddLessonModal";

export default function LessonsManagementView({
  gradeId,
  subjectId,
  unitId,
}) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    if (!unitId) return;

    setLoading(true);

    const q = query(
      collection(db, "lessons"),
      where("gradeId", "==", gradeId),
      where("subjectId", "==", subjectId),
      where("unitId", "==", unitId),
      orderBy("lessonOrder", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setLessons(data);
        setLoading(false);
      },
      (err) => {
        console.error("Dashboard lessons error:", err);
        setLessons([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [gradeId, subjectId, unitId]);

  async function toggleActive(lesson) {
    await updateDoc(doc(db, "lessons", lesson.id), {
      active: !lesson.active,
    });
  }

  if (!unitId) {
    return (
      <div className="text-gray-400">
        اختر وحدة لعرض دروسها
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-yellow-400">
          📘 إدارة الدروس
        </h2>

        <button
          onClick={() => setOpenAdd(true)}
          className="px-5 py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
        >
          + إضافة درس
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-400">جارٍ تحميل الدروس…</div>
      ) : lessons.length === 0 ? (
        <div className="text-gray-400">لا توجد دروس بعد</div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-black/60 border border-yellow-500/30"
            >
              <div>
                <div className="font-bold text-white">
                  {lesson.lessonOrder}. {lesson.title}
                </div>
                <div className="text-sm text-gray-400">
                  {lesson.active ? "مفعل" : "معطل"}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleActive(lesson)}
                  className={`px-4 py-1 rounded-md text-sm font-bold transition
                    ${
                      lesson.active
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-green-600 hover:bg-green-500"
                    }
                  `}
                >
                  {lesson.active ? "تعطيل" : "تفعيل"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {openAdd && (
        <AddLessonModal
          gradeId={gradeId}
          subjectId={subjectId}
          unitId={unitId}
          onClose={() => setOpenAdd(false)}
        />
      )}
    </div>
  );
}
