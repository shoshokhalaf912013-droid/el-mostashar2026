import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../firebase";
import UnitCard from "../UnitCard";
import { generateUnitTitle } from "@/utils/generateUnitTitle";

export default function BacUnitsView() {

  const { gradeId, subjectId } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [canManageUnits, setCanManageUnits] = useState(false);

  /* ================= REAL AUTH CHECK ================= */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      getAuth(),
      async (user) => {

        console.log("========== AUTH DEBUG ==========");

        if (!user) {
          console.log("NO USER");
          setCanManageUnits(false);
          return;
        }

        console.log("AUTH UID =", user.uid);
        console.log("AUTH EMAIL =", user.email);

        try {

          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);

          if (!snap.exists()) {
            console.log("USER DOC NOT FOUND");
            setCanManageUnits(false);
            return;
          }

          const role = snap.data().role;

          console.log("FIRESTORE ROLE =", role);

          const allow =
            role === "super-admin" || role === "admin";

          console.log("CAN MANAGE =", allow);

          setCanManageUnits(allow);

        } catch (err) {
          console.error("ROLE LOAD ERROR:", err);
          setCanManageUnits(false);
        }
      }
    );

    return () => unsubscribe();

  }, []);

  /* ================= LOAD UNITS ================= */

  useEffect(() => {
    if (!gradeId || !subjectId) return;
    loadUnits();
  }, [gradeId, subjectId]);

  async function loadUnits() {

    const q = query(
      collection(db, "units"),
      where("systemId", "==", "bac"),
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

  /* ================= ADD UNIT ================= */

  async function handleAddUnit() {

    if (!canManageUnits) return;

    const nextOrder =
      units.length > 0
        ? Math.max(...units.map(u => Number(u.order || 0))) + 1
        : 1;

    await addDoc(collection(db, "units"), {
      order: nextOrder,
      unitId: `unit-${nextOrder}`,
      title: generateUnitTitle(nextOrder, subjectId),
      active: true,
      gradeId,
      subjectId,
      systemId: "bac",
      stageId: "secondary",
    });

    loadUnits();
  }

  /* ================= UI ================= */

  return (
    <div className="bg-black min-h-screen px-6 py-10 text-white">

      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex justify-between items-center">

          <h2 className="text-2xl font-bold">
            الوحدات (البكالوريا)
          </h2>

          {canManageUnits && (
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
              canManageUnits={canManageUnits}
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
