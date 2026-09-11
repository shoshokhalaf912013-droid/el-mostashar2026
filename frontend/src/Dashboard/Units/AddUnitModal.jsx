import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function AddUnitModal({ gradeId, stageId, subjectId, onClose, unitsCount }) {
  const [titleAr, setTitleAr] = useState("");

  const handleAdd = async () => {
    const order = unitsCount + 1;

    await addDoc(collection(db, "units"), {
      titleAr,
      order,
      active: true,
      gradeId,
      stageId,
      subjectId,
      systemId: "general",
      trackId: null,
      unitId: `unit-${order}`,
      createdAt: new Date(),
    });

    alert("تم إضافة الوحدة 👑");
    onClose();
    window.location.reload();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>إضافة وحدة جديدة</h2>

        <input
          placeholder="اسم الوحدة"
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
        />

        <button onClick={handleAdd}>حفظ</button>
        <button onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
