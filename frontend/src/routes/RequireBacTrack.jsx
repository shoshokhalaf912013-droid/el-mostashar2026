import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

/*
  Guard خاص بالبكالوريا (مُعطَّل مؤقتًا):
  - لا يمنع الدخول
  - يسمح بعرض الوحدات دائمًا
*/

export default function RequireBacTrack({ children }) {
  const { gradeId, subjectId } = useParams();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔓 تعطيل المنع بالكامل
    setLoading(false);
  }, [gradeId, subjectId]);

  if (loading) {
    return (
      <div className="p-10 text-center text-white">
        جاري التحميل...
      </div>
    );
  }

  // ✅ السماح الدائم بالدخول
  return children;
}
