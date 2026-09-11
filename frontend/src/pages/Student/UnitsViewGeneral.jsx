import "./UnitsViewGeneral.css";
import { addNextUnit } from "@/utils/addNextUnit";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import UnitCard from "./UnitCard";
import useUserRole from "@/hooks/useUserRole";

/* ================= Arabic Names ================= */

const getUnitArabicName = (num) => {

  const map = {
    1: "الأولى",
    2: "الثانية",
    3: "الثالثة",
    4: "الرابعة",
    5: "الخامسة",
    6: "السادسة",
    7: "السابعة",
    8: "الثامنة",
    9: "التاسعة",
    10: "العاشرة",
    11: "الحادية عشرة",
    12: "الثانية عشرة",
  };

  return map[num] || num;

};

export default function UnitsViewGeneral() {

  const params = useParams();
  const { role } = useUserRole();

  const canManageUnits =
    role === "super-admin" || role === "teacher";

  const [units, setUnits] = useState([]);

  /* ================= PARAMS ================= */

  const gradeId = params.gradeId;
  const subjectId = params.subjectId;

  /* ================= تحديد المرحلة بشكل آمن ================= */

  let stageId = "primary";

  if (gradeId && gradeId.includes("prep")) {
    stageId = "preparatory";
  }

  /* ================= LOAD UNITS ================= */

  const loadUnits = async () => {

    if (!gradeId || !subjectId) return;

    try {

      const q = query(
        collection(db, "units"),
        where("systemId", "==", "general"),
        where("gradeId", "==", gradeId),
        where("subjectId", "==", subjectId)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      console.log("Units loaded:", data);

      data.sort((a, b) => (a.order || 0) - (b.order || 0));

      setUnits(data);

    } catch (error) {

      console.error("Error loading units:", error);

    }

  };

  useEffect(() => {

    loadUnits();

  }, [gradeId, subjectId]);

  /* ================= UI ================= */

  return (

    <div className="units-container">

      {canManageUnits && (
        <button
          className="add-unit-btn"
          onClick={async () => {
            await addNextUnit(stageId, gradeId, subjectId);
            await loadUnits();
          }}
        >
          ➕ إضافة وحدة جديدة
        </button>
      )}

      {units.map((u, index) => {

        const order = u.order || index + 1;

        const displayTitle =
          u.title || `الوحدة ${getUnitArabicName(order)}`;

        return (
          <UnitCard
            key={u.id}
            unit={{
              ...u,
              title: displayTitle,
              stageId: stageId,
              gradeId: gradeId,
              subjectId: subjectId
            }}
          />
        );

      })}

    </div>

  );

}