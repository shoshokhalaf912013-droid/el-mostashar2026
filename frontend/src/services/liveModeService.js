// ============================================
// File: src/services/liveModeService.js
// ============================================

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/*
  تغيير وضع الحصة
  explanation | review | practice
*/

export const changeLiveMode = async (mode) => {
  try {
    const ref = doc(db, "liveSession", "current");

    await updateDoc(ref, {
      mode: mode,
    });

    console.log("✅ Mode Changed:", mode);
  } catch (error) {
    console.error("❌ Mode Error:", error);
  }
};