// ============================================
// File: src/services/livePulseService.js
// ============================================

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

/*
  ارسال نبضة نشاط الطالب
*/

export const sendStudentPulse = async (userId, lessonId) => {
  try {
    const ref = doc(db, "livePulse", userId);

    await setDoc(
      ref,
      {
        userId,
        lessonId,
        lastActiveAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Pulse Error:", error);
  }
};