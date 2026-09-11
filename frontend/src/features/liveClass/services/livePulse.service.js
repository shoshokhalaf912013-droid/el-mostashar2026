import {
  doc,
 setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
} from "firebase/firestore";

import { db } from "../../../firebase";

/*
==================================================
STUDENT SEND PULSE  (رفع اليد / تفاعل الطالب)
==================================================
*/

export const sendStudentPulse = async (
  classId,
  studentId,
  state
) => {
  try {
    const ref = doc(
      db,
      "liveClasses",
      classId,
      "pulse",
      studentId
    );

    await setDoc(
      ref,
      {
        studentId: studentId,
        state: state, // hand | question | ok | idle
        updatedAt: serverTimestamp(),
      },
      { merge: true } // مهم جداً حتى لا يمسح بيانات لاحقاً
    );
  } catch (error) {
    console.error("Pulse Send Error:", error);
  }
};

/*
==================================================
TEACHER LISTEN TO STUDENTS (استقبال المعلم للتفاعل)
==================================================
*/

export const listenPulse = (classId, callback) => {
  try {
    const ref = collection(
      db,
      "liveClasses",
      classId,
      "pulse"
    );

    return onSnapshot(ref, (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        id: doc.id,        // ⭐ مهم (studentId الحقيقي)
        ...doc.data(),
      }));

      callback(students);
    });
  } catch (error) {
    console.error("Pulse Listen Error:", error);
  }
};