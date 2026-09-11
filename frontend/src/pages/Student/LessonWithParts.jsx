import { useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase"; // عدّل المسار حسب مشروعك

const LessonWithParts = ({ lessonId, lessonTitle }) => {
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadParts = async () => {
    setLoading(true);

    const q = query(
      collection(db, "lesson_parts"),
      where("lessonId", "==", lessonId),
      where("isActive", "==", true),
      orderBy("partNumber", "asc")
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setParts(data);
    setLoading(false);
  };

  const toggle = () => {
    if (!open) {
      loadParts();
    }
    setOpen(!open);
  };

  return (
    <div style={{ border: "1px solid #ddd", marginBottom: 8, padding: 8 }}>
      <div
        onClick={toggle}
        style={{
          cursor: "pointer",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>{lessonTitle}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ marginTop: 8, paddingLeft: 12 }}>
          {loading && <div>جاري التحميل...</div>}

          {!loading &&
            parts.map(part => (
              <div key={part.id} style={{ padding: "4px 0" }}>
                {part.partNumber} - {part.title}
              </div>
            ))}

          {!loading && parts.length === 0 && (
            <div>لا يوجد أجزاء</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonWithParts;
