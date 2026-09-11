import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../firebase";
import { useSecondary } from "../../contexts/SecondaryContext";

import "./styles/secondaryLessons.css";

export default function SecondaryLessonsView() {
  const { unitId } = useParams();
  const navigate = useNavigate();

  const { gradeId, trackId } = useSecondary();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!unitId || !gradeId || !trackId) return;

    const q = query(
      collection(db, "lessons"),
      where("unitId", "==", unitId),
      where("gradeId", "==", gradeId),
      where("trackId", "==", trackId),
      where("active", "==", true),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLessons(data);
      setLoading(false);
    });

    return () => unsub();
  }, [unitId, gradeId, trackId]);

  if (loading) {
    return (
      <div className="secondary-lessons loading">
        <p>جاري تحميل الدروس...</p>
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="secondary-lessons empty">
        <p>لا توجد دروس متاحة لهذه الوحدة</p>
      </div>
    );
  }

  return (
    <div className="secondary-lessons">
      <h2 className="lessons-title">الدروس</h2>

      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="lesson-card"
            onClick={() =>
              navigate(
                `/student/lesson/${gradeId}/${lesson.subjectId}/${unitId}/${lesson.id}`
              )
            }
          >
            <div className="lesson-order">{lesson.order}</div>
            <div className="lesson-info">
              <h3>{lesson.title}</h3>
              {lesson.description && <p>{lesson.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
