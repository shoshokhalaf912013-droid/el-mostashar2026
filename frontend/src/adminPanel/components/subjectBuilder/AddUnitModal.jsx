import { useState } from "react";
import PropTypes from "prop-types";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "../../../firebase";
import "./AddUnitModal.css";

export default function AddUnitModal({
  open,
  onClose,
  gradeId,
  subjectId,
  systemId = "general",
  trackId = null,
}) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // تحويل رقم الوحدة إلى اسم
  const arabicNames = ["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة"];
  const englishNames = ["One","Two","Three","Four","Five","Six"];

  const isArabicSubject = subjectId === "arabic" || subjectId === "religionIslamic" || subjectId === "religionChristian";

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 🔹 احضر آخر ترتيب
      const q = query(
        collection(db, "units"),
        where("gradeId", "==", gradeId),
        where("subjectId", "==", subjectId),
        where("systemId", "==", systemId),
        orderBy("order", "desc"),
        limit(1)
      );

      const snap = await getDocs(q);
      let nextOrder = 1;

      if (!snap.empty) {
        nextOrder = snap.docs[0].data().order + 1;
      }

      // 🔹 عنوان تلقائي
      const titleAr = `الوحدة ${arabicNames[nextOrder - 1] || nextOrder}`;
      const titleEn = `Unit ${englishNames[nextOrder - 1] || nextOrder}`;

      const data = {
        gradeId,
        subjectId,
        systemId,
        trackId: trackId || null,
        order: nextOrder,
        titleAr,
        titleEn,
        active: true,
        deleted: false,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "units"), data);

      onClose();
    } catch (err) {
      console.error("Add unit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-unit-overlay">
      <div className="add-unit-modal">
        <h3>إضافة وحدة تلقائية</h3>

        <p style={{color:"#aaa",fontSize:13}}>
          سيتم الترتيب والتسمية تلقائيًا
        </p>

        <div className="add-unit-actions">
          <button className="btn-gold" onClick={handleSubmit} disabled={loading}>
            {loading ? "جارٍ الإضافة..." : "إضافة وحدة"}
          </button>

          <button className="btn-cancel" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

AddUnitModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  gradeId: PropTypes.string.isRequired,
  subjectId: PropTypes.string.isRequired,
  systemId: PropTypes.string,
  trackId: PropTypes.string,
};
