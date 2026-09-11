import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function UnitsGrid({
  gradeId,
  subjectId,
  trackId = null,
}) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!gradeId || !subjectId) return;

    let q = query(
      collection(db, "units"),
      where("active", "==", true),
      where("gradeId", "==", gradeId),
      where("subjectId", "==", subjectId),
      orderBy("order", "asc")
    );

    // trackId اختياري (للعلمي / الأدبي فقط)
    if (trackId) {
      q = query(
        collection(db, "units"),
        where("active", "==", true),
        where("gradeId", "==", gradeId),
        where("subjectId", "==", subjectId),
        where("trackId", "==", trackId),
        orderBy("order", "asc")
      );
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUnits(data);
      setLoading(false);
    });

    return () => unsub();
  }, [gradeId, subjectId, trackId]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-6">
        جاري تحميل الوحدات...
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6">
        لا توجد وحدات متاحة حاليًا
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {units.map((unit) => (
        <button
          key={unit.id}
          onClick={() =>
            navigate(
              `/student/units/${gradeId}/${subjectId}/${unit.unitId}`
            )
          }
          className="
            border border-yellow-500
            text-yellow-400
            rounded-lg
            py-3
            text-sm
            transition-all
            duration-200
            hover:bg-yellow-500
            hover:text-black
            hover:shadow-lg
          "
        >
          {unit.title}
        </button>
      ))}
    </div>
  );
}
