import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function GradeSubjects({ gradeId }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gradeId) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);

        const ref = doc(db, "subjectsByGrade", gradeId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          throw new Error("الصف غير موجود في Firestore");
        }

        const data = snap.data();
        setSubjects(data.commonAdded || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [gradeId]);

  if (loading) return <p>جاري تحميل المواد…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h3>المواد</h3>
      <ul>
        {subjects.map((subject, index) => (
          <li key={index}>{subject}</li>
        ))}
      </ul>
    </div>
  );
}
