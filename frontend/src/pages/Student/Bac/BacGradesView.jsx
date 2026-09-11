import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase";

export default function BacGradesView() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGrades();
  }, []);

  async function fetchGrades() {
    setLoading(true);

    try {
      const q = query(
        collection(db, "grades"),
        where("active", "==", true),
        where("stageId", "==", "secondary"), // ✔ مهم
        where("systemId", "==", "bac"),      // ✔ مهم
        orderBy("order")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGrades(data);
    } catch (e) {
      console.error("❌ Bac grades error:", e);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-white">جاري التحميل...</div>;
  }

  if (!grades.length) {
    return (
      <div className="p-10 text-red-400 text-center">
        لا توجد صفوف بكالوريا
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-2xl text-yellow-400 mb-10 text-center">
        صفوف البكالوريا
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {grades.map((g) => (
          <div
            key={g.id}
            onClick={() =>
              navigate(`/student/bac/subjects/${g.gradeId}`)
            }
            className="
              cursor-pointer
              bg-zinc-900
              rounded-xl
              p-8
              text-center
              border border-yellow-700/40
              hover:border-yellow-400
              transition
            "
          >
            <div className="text-xl text-yellow-200 font-semibold">
              {g.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
