import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase";

export default function SelectGrade() {

  const navigate = useNavigate();

  const params = useParams();

  const stageId = params.stageId;

  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchGrades = async () => {

      try {

        const q = query(
          collection(db, "grades"),
          where("stageId", "==", stageId),
          where("active", "==", true),
          orderBy("order", "asc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Grades:", data);

        setGrades(data);

      } catch (e) {

        console.error("Error loading grades:", e);

      } finally {

        setLoading(false);

      }

    };

    if (stageId) {
      fetchGrades();
    }

  }, [stageId]);

  if (loading) {
    return (
      <div className="text-white text-center mt-20">
        تحميل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-10">

      <h1 className="text-3xl font-bold text-yellow-400 text-center mb-10">
        اختر الصف
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {grades.map((grade) => (

          <div
            key={grade.id}
            onClick={() => {

              navigate(
                `/student/${stageId}/subjects/${grade.id}`
              );

            }}
            className="cursor-pointer rounded-xl border border-yellow-500/40 bg-zinc-900 p-8 text-center hover:scale-105 transition"
          >

            <h2 className="text-xl text-yellow-300">
              {grade.title}
            </h2>

          </div>

        ))}

      </div>

    </div>
  );
}