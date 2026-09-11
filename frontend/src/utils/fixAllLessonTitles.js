import {
  collectionGroup,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { db } from "@/firebase";

/* ===============================
   NUMBERS TO ARABIC WORDS
================================ */

const arabicNumbers = {
  1: "الأول",
  2: "الثاني",
  3: "الثالث",
  4: "الرابع",
  5: "الخامس",
  6: "السادس",
  7: "السابع",
  8: "الثامن",
  9: "التاسع",
  10: "العاشر",
  11: "الحادي عشر",
  12: "الثاني عشر",
  13: "الثالث عشر",
  14: "الرابع عشر",
  15: "الخامس عشر",
  16: "السادس عشر",
  17: "السابع عشر",
  18: "الثامن عشر",
  19: "التاسع عشر",
  20: "العشرون",
};

/* ===============================
   MAIN MIGRATION
================================ */

export async function fixAllLessonTitles() {
  try {
    console.log("🚀 Start fixing lessons...");

    // يجلب كل lessons فى كل الأنظمة مرة واحدة
    const snap = await getDocs(collectionGroup(db, "lessons"));

    let updated = 0;

    for (const lessonDoc of snap.docs) {
      const data = lessonDoc.data();

      const order = Number(data.order || 0);
      if (!order) continue;

      const arabicWord = arabicNumbers[order];
      if (!arabicWord) continue;

      const newTitle = `الدرس ${arabicWord}`;

      // لو الاسم صحيح بالفعل نتجاهله
      if (data.title === newTitle) continue;

      await updateDoc(
        doc(db, lessonDoc.ref.path),
        { title: newTitle }
      );

      updated++;
      console.log("✔ updated:", lessonDoc.id);
    }

    console.log(`✅ DONE — Updated ${updated} lessons`);
    alert(`تم تعديل ${updated} درس بنجاح`);
  } catch (err) {
    console.error(err);
    alert("حدث خطأ");
  }
}
