// src/pages/Student/PrimaryPrep/PrimaryPrepSubjectsView.jsx
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

export default function PrimaryPrepSubjectsView() {
  const { gradeId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(
          collection(db, "gradeSubjects"),
          where("gradeId", "==", gradeId),
          where("active", "==", true),
          orderBy("order", "asc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSubjects(data);
      } catch (e) {
        console.error("Subjects error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [gradeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        تحميل...
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
        لا توجد مواد
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() =>
              navigate(
                `/student/primary-prep/units/${gradeId}/${s.subjectId}`
              )
            }
            className="p-6 rounded-xl border border-yellow-500/40 text-white hover:border-yellow-400"
          >
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
