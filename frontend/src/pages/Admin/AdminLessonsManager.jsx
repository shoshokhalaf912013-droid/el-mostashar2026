import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function AdminSubjectBuilder() {
  const { gradeId, subjectKey } = useParams();

  const [units, setUnits] = useState([]);
  const [newUnitTitle, setNewUnitTitle] = useState("");

  /* ================= جلب الوحدات ================= */
  useEffect(() => {
    if (!gradeId || !subjectKey) return;

    const q = query(
      collection(db, "units"),
      where("gradeId", "==", gradeId),
      where("subjectKey", "==", subjectKey),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUnits(data);
    });

    return () => unsub();
  }, [gradeId, subjectKey]);

  /* ================= إضافة وحدة ================= */
  const addUnit = async () => {
    if (!newUnitTitle.trim()) return;

    await addDoc(collection(db, "units"), {
      title: newUnitTitle,
      gradeId,
      subjectKey,
      order: units.length + 1,
      createdAt: serverTimestamp(),
    });

    setNewUnitTitle("");
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl text-yellow-400 mb-6">
        إدارة الوحدات والدروس
      </h1>

      {/* ===== إضافة وحدة ===== */}
      <div className="bg-[#111] p-4 rounded mb-8">
        <h2 className="text-lg mb-3 text-yellow-300">إضافة وحدة جديدة</h2>

        <div className="flex gap-3">
          <div className="w-32 text-gray-400 flex items-center">
            الوحدة {units.length + 1}
          </div>

          <input
            value={newUnitTitle}
            onChange={(e) => setNewUnitTitle(e.target.value)}
            placeholder="اسم الوحدة (حقل واسع)"
            className="flex-1 p-2 rounded bg-black border border-gray-700"
          />

          <button
            onClick={addUnit}
            className="bg-green-600 px-6 rounded"
          >
            إضافة
          </button>
        </div>
      </div>

      {/* ===== الوحدات ===== */}
      {units.length === 0 ? (
        <div className="text-gray-400">لا توجد وحدات بعد</div>
      ) : (
        units.map((unit, unitIndex) => (
          <UnitBlock
            key={unit.id}
            unit={unit}
            unitIndex={unitIndex}
          />
        ))
      )}
    </div>
  );
}

/* ================================================= */
/* ================= وحدة واحدة ==================== */
/* ================================================= */

function UnitBlock({ unit, unitIndex }) {
  const [lessons, setLessons] = useState([]);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "lessons"),
      where("unitId", "==", unit.id),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLessons(data);
    });

    return () => unsub();
  }, [unit.id]);

  const addLesson = async () => {
    if (!newLessonTitle.trim()) return;

    await addDoc(collection(db, "lessons"), {
      title: newLessonTitle,
      unitId: unit.id,
      order: lessons.length + 1,
      createdAt: serverTimestamp(),
    });

    setNewLessonTitle("");
  };

  return (
    <div className="border border-gray-700 rounded p-4 mb-6 bg-[#0b0b0b]">
      <h3 className="text-yellow-400 mb-4">
        الوحدة {unitIndex + 1} : {unit.title}
      </h3>

      {/* إضافة درس */}
      <div className="flex gap-3 mb-4">
        <div className="w-32 text-gray-400 flex items-center">
          الدرس {lessons.length + 1}
        </div>

        <input
          value={newLessonTitle}
          onChange={(e) => setNewLessonTitle(e.target.value)}
          placeholder="اسم الدرس (حقل واسع)"
          className="flex-1 p-2 rounded bg-black border border-gray-700"
        />

        <button
          onClick={addLesson}
          className="bg-blue-600 px-6 rounded"
        >
          إضافة
        </button>
      </div>

      {/* قائمة الدروس */}
      {lessons.length === 0 ? (
        <div className="text-gray-500">لا توجد دروس بعد</div>
      ) : (
        lessons.map((lesson, lessonIndex) => (
          <div
            key={lesson.id}
            className="bg-[#111] p-2 rounded mb-2"
          >
            الدرس {lessonIndex + 1} : {lesson.title}
          </div>
        ))
      )}
    </div>
  );
}
