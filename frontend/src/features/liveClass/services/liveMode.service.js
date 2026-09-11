import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../../firebase";

/*
====================================
CREATE / START LIVE CLASS
====================================
*/

export const startLiveClass = async (classId, teacherId) => {
  const ref = doc(db, "liveClasses", classId);

  await setDoc(ref, {
    teacherId,
    status: "live",
    startedAt: serverTimestamp(),
  });
};

/*
====================================
END LIVE CLASS
====================================
*/

export const endLiveClass = async (classId) => {
  const ref = doc(db, "liveClasses", classId);

  await updateDoc(ref, {
    status: "ended",
  });
};

/*
====================================
LISTEN LIVE STATUS
====================================
*/

export const listenLiveClass = (classId, callback) => {
  const ref = doc(db, "liveClasses", classId);

  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
};