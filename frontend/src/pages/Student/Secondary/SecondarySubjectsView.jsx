import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";

export default function SubjectsView() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    setLoading(true);

    try {
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

          return (
            title === "التاريخ" ||
            title === "الجغرافيا"
          );
        })
        .sort(
          (a, b) =>
            (a.order ?? 0) - (b.order ?? 0)
        );

      setSubjects(data);
    } catch (error) {
      console.error("❌ Error loading secondary subjects:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-10 text-center text-white">
        جاري التحميل...
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="min-h-screen bg-black p-10 text-center text-red-400">
        لا توجد مواد
      </div>
    );
  }

  const added = subjects.filter(
    (subject) => subject.inTotal === true
  );

  const notAdded = subjects.filter(
    (subject) => subject.inTotal !== true
  );

  const renderGrid = (list) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {list.map((subject) => (
        <Link
          key={subject.id}
          to={`/student/secondary/units/sec1/${subject.subjectId}`}
          className="
            block
            bg-zinc-900
            rounded-xl
            p-8
            text-center
            border border-yellow-700/40
            hover:border-yellow-400
            hover:shadow-[0_0_18px_rgba(255,215,0,0.35)]
            transition
          "
        >
          <div className="text-xl text-yellow-200 font-semibold">
            {subject.title}
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-2xl text-yellow-400 text-center mb-10">
        مواد الصف الأول الثانوي
      </h1>

      {added.length > 0 && (
        <>
          <h2 className="text-xl text-yellow-300 mb-4">
            المواد المضافة
          </h2>

          {renderGrid(added)}
        </>
      )}

      {notAdded.length > 0 && (
        <>
          <h2 className="text-xl text-yellow-300 mt-10 mb-4">
            مواد غير مضافة
          </h2>

          {renderGrid(notAdded)}
        </>
      )}

    </div>
  );
}