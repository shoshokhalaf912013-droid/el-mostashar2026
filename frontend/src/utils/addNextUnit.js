import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "@/firebase";
import { generateUnitTitle } from "./generateUnitTitle";

export async function addNextUnit(stageId, gradeId, subjectId) {

  const q = query(
    collection(db, "units"),
    where("systemId", "==", "general"),
    where("stageId", "==", stageId),
    where("gradeId", "==", gradeId),
    where("subjectId", "==", subjectId)
  );

  const snap = await getDocs(q);

  const nextOrder = snap.size + 1;

  await addDoc(collection(db, "units"), {

    systemId: "general",
    stageId,
    gradeId,
    subjectId,

    order: nextOrder,
    title: generateUnitTitle(nextOrder, subjectId),

    active: true,
    trackId: null,
    unitId: `unit-${nextOrder}`,
    createdAt: Date.now()
  });
}
