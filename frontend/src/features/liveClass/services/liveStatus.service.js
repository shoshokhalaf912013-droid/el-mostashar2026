// src/features/liveClass/services/liveStatus.service.js

import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase";

/* ================= START LIVE ================= */

export const startLiveClass = async (lessonId, teacherId) => {
  const ref = doc(db, "liveClasses", lessonId);

  await setDoc(
    ref,
    {
      lessonId,
      teacherId,
      status: "live",
      startedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/* ================= END LIVE ================= */

export const endLiveClass = async (lessonId) => {
  const ref = doc(db, "liveClasses", lessonId);

  await updateDoc(ref, {
    status: "ended",
    endedAt: serverTimestamp(),
  });
};

/* ================= LISTEN STATUS ================= */

export const listenLiveStatus = (lessonId, callback) => {
  const ref = doc(db, "liveClasses", lessonId);

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }

    callback(snap.data());
  });
};