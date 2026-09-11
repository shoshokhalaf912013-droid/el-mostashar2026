import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";

import { db } from "../../firebase";
import UnitCard from "./UnitCard";
import { useAuth } from "@/contexts/AuthContext";

export default function UnitsView() {

  const { gradeId, subjectId } = useParams();
  const navigate = useNavigate();

  /* ✅ جلب الرول الصحيح */
  const { user, role } = useAuth();

  const [units, setUnits] = useState([]);

  /* ✅ صلاحيات حقيقية */
  const canManage =
    role === "super-admin" ||
    role === "admin" ||
    role === "teacher";

  useEffect(() => {
    loadUnits();
  }, [gradeId, subjectId]);

  async function loadUnits() {

    const q = query(
      collection(db, "units"),
      where("systemId", "==", "general"),
      where("gradeId", "==", gradeId),
      where("subjectId", "==", subjectId),
      where("active", "==", true)
    );

    const snap = await getDocs(q);

    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    setUnits(data);
  }

  /* ================= ADD ================= */

  async function handleAddUnit() {

    if (!canManage) {
      console.log("❌ NO PERMISSION");
      return;
    }

    const nextOrder =
      units.length > 0
        ? Math.max(...units.map(u => Number(u.order || 0))) + 1
        : 1;

    await addDoc(collection(db, "units"), {
      order: nextOrder,
      unitId: `unit-${nextOrder}`,
      title: `الوحدة ${nextOrder}`,
      active: true,
      gradeId,
      subjectId,
      systemId: "general",
    });

    loadUnits();
  }

  /* ================= UI ================= */

  return (
    <div className="bg-black min-h-screen px-6 py-10 text-white">

      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">الوحدات</h2>

          {canManage && (
            <button
              onClick={handleAddUnit}
              className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-bold"
            >
              + إضافة وحدة
            </button>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              canManage={canManage}
              onClick={() =>
                navigate(
                  `/student/secondary/lessons/${gradeId}/${subjectId}/${unit.unitId}`
                )
              }
            />
          ))}
        </div>

      </div>
    </div>
  );
}
