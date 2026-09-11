import { doc } from "firebase/firestore";
import { db } from "@/firebase";

export const lessonRef = (
  gradeId,
  subjectId,
  unitId,
  lessonId
) =>
  doc(
    db,
    "grades",
    gradeId,
    "subjects",
    subjectId,
    "units",
    unitId,
    "lessons",
    lessonId
  );