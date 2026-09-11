import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

import UnitCard from "../Student/UnitCard";

export default function UnitsViewSuperAdmin() {
  const { systemId, gradeId, subjectId } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  /* ================= LOAD UNITS ================= */
  useEffect(() => {
    loadUnits();
    // eslint-disable-next-line
  }, [systemId, gradeId, subjectId]);

  async function loadUnits() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "units"),
        where("systemId", "==", systemId),
        where("gradeId", "==", gradeId),
        where("subjectId", "==", subjectId)
      );

      const snap = await getDocs(q);

      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      setUnits(data);
    } catch (err) {
      console.error("❌ Load units error:", err);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= ADD UNIT ================= */
  async function handleAddUnit() {
    if (!newTitle.trim()) return;

    try {
      const maxOrder =
        units.length > 0
          ? Math.max(...units.map((u) => Number(u.order || 0)))
          : 0;

      const nextOrder = maxOrder + 1;

      await addDoc(collection(db, "units"), {
        unitId: `unit-${nextOrder}`,
        order: nextOrder,
        title: newTitle.trim(),
        active: true,

        systemId,
        gradeId,
        subjectId,

        stageId:
          systemId === "bac"
            ? "bac"
            : gradeId.startsWith("sec")
            ? "secondary"
            : "primary",

        source: "super-admin",
        createdAt: serverTimestamp(),
      });

      setNewTitle("");
      setShowAdd(false);
      loadUnits();
    } catch (err) {
      console.error("❌ Add unit failed:", err);
    }
  }

  /* ================= TOGGLE ACTIVE ================= */
  async function toggleUnit(unit) {
    try {
      await updateDoc(doc(db, "units", unit.id), {
        active: !unit.active,
      });

      loadUnits();
    } catch (err) {
      console.error("❌ Toggle unit failed:", err);
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-10 text-yellow-400 text-lg">
        جاري تحميل الوحدات…
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="p-10 space-y-8 text-yellow-400">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-wide">
          إدارة الوحدات
        </h2>

        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-2 rounded-xl font-extrabold
                     bg-gradient-to-b from-yellow-200 to-yellow-500
                     text-black hover:from-yellow-100 hover:to-yellow-400"
        >
          + إضافة وحدة
        </button>
      </div>

      {/* ===== ADD PANEL ===== */}
      {showAdd && (
        <div className="bg-black border border-yellow-500/40 rounded-2xl p-6 space-y-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان الوحدة"
            className="w-full px-4 py-3 rounded-xl
                       bg-black border border-yellow-500/40
                       text-yellow-300 focus:outline-none"
          />

          <div className="flex gap-4">
            <button
              onClick={handleAddUnit}
              className="px-6 py-2 rounded-xl
                         bg-gradient-to-b from-green-400 to-green-600
                         text-black font-bold"
            >
              حفظ
            </button>

            <button
              onClick={() => setShowAdd(false)}
              className="px-6 py-2 rounded-xl bg-zinc-800 text-yellow-300"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ===== UNITS LIST ===== */}
      {!units.length ? (
        <div className="text-zinc-500">
          لا توجد وحدات بعد
        </div>
      ) : (
        <div className="space-y-5">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center justify-between gap-6"
            >
              {/* ✅ التعديل الحقيقي هنا */}
              <UnitCard
                unit={unit}
                isAdmin={true}
                onClick={() =>
                  navigate(
                    `/super-admin/lessons/${systemId}/${gradeId}/${subjectId}/${unit.unitId}/add`
                  )
                }
              />

              <button
                onClick={() => toggleUnit(unit)}
                className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  unit.active
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-green-700 hover:bg-green-600"
                }`}
              >
                {unit.active ? "تعطيل" : "تفعيل"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
