import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export async function generateUnitsFromTemplate({
  templateId,
  gradeId,
  subjectId,
  trackId = null,
}) {
  const templateSnap = await getDoc(
    doc(db, "unitTemplates", templateId)
  );

  if (!templateSnap.exists()) return;

  const { units } = templateSnap.data();

  for (const unit of units) {
    await addDoc(collection(db, "units"), {
      title: unit.title,
      order: unit.order,
      gradeId,
      subjectId,
      trackId,
      active: true,
      createdAt: new Date(),
    });
  }
}
