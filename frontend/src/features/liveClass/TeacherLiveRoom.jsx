import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../../firebase";
import StudentsPanel from "./components/StudentsPanel";

export default function TeacherLiveRoom({ classId }) {

  /* ================= STATES ================= */

  const [students, setStudents] = useState([]);
  const [liveInfo, setLiveInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD LIVE DATA ================= */

  useEffect(() => {

    if (!classId) return;

    const liveRef = doc(db, "liveClasses", classId);

    const loadLive = async () => {
      const snap = await getDoc(liveRef);

      if (snap.exists()) {
        setLiveInfo(snap.data());
      }

      setLoading(false);
    };

    loadLive();

  }, [classId]);

  /* ================= STUDENTS REALTIME ================= */

  useEffect(() => {

    if (!classId) return;

    const pulseRef = collection(
      db,
      "liveClasses",
      classId,
      "pulse"
    );

    const unsubscribe = onSnapshot(pulseRef, (snapshot) => {

      const list = [];

      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setStudents(list);
    });

    return () => unsubscribe();

  }, [classId]);

  /* ================= UI ================= */

  if (loading) {
    return <div style={{ padding: 30 }}>⏳ Loading Live Room...</div>;
  }

  return (
    <div style={{ padding: 30 }}>

      <h2>🎥 Teacher Live Room</h2>

      {/* معلومات الحصة */}
      {liveInfo && (
        <div style={{
          background: "#f5f7fb",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20
        }}>
          <strong>Lesson:</strong> {liveInfo.lessonTitle || "Live Class"} <br />
          <strong>Status:</strong> {liveInfo.status}
        </div>
      )}

      {/* لوحة الطلاب */}
      <StudentsPanel students={students} />

    </div>
  );
}