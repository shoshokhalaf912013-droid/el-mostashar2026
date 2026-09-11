import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";


export async function createLesson({
  gradeId,
  subjectId,
  unitId,
}) {

  try {

    // ✅ fallback يمنع الانهيار لو القيم لم تصل
    const lessonData = {
      title: "درس جديد",
      description: "",
      active: true,

      gradeId: gradeId || "sec3",
      subjectId: subjectId || "biology",
      unitId: unitId || "unit-1",

      lessonOrder: Date.now(),
      flow: [],

      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "lessons"),
      lessonData
    );

    return docRef.id;

  } catch (error) {
    console.error("CREATE LESSON ERROR:", error);
    alert("حدث خطأ أثناء إنشاء الدرس");
    throw error;
  }
}
