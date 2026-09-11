// src/utils/generateUnits.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * يولّد وحدة واحدة فقط
 * يحدد رقمها تلقائيًا (آخر order + 1)
 * العنوان افتراضي ويمكن تعديله يدويًا بعد الإضافة
 */
export async function generateUnits({
  gradeId,
  stageId,
  subjectId,
  systemId,
  trackId = null,
}) {
  if (!gradeId || !stageId || !subjectId || !systemId) {
    console.error("❌ Missing required params");
    return;
  }

  const unitsRef = collection(db, "units");

  // =============================
  // 1️⃣ جلب آخر وحدة موجودة
  // =============================
  const conditions = [
    where("gradeId", "==", gradeId),
    where("stageId", "==", stageId),
    where("subjectId", "==", subjectId),
    where("systemId", "==", systemId),
  ];

  if (trackId) {
    conditions.push(where("trackId", "==", trackId));
  }

  const lastUnitQuery = query(
    unitsRef,
    ...conditions,
    orderBy("order", "desc"),
    limit(1)
  );

  const snap = await getDocs(lastUnitQuery);

  const lastOrder = snap.empty ? 0 : snap.docs[0].data().order || 0;
  const nextOrder = lastOrder + 1;

  // =============================
  // 2️⃣ إنشاء وحدة واحدة فقط
  // =============================
  const unitData = {
    unitId: `unit-${nextOrder}`,
    order: nextOrder,
    title: `الوحدة ${nextOrder}`, // ✍️ تعدله يدويًا كما تشاء
    active: true,

    gradeId,
    stageId,
    subjectId,
    systemId,
    trackId,

    source: "generated",
    createdAt: serverTimestamp(),
  };

  await addDoc(unitsRef, unitData);

  console.log(`✅ Unit ${nextOrder} added successfully`);
}
