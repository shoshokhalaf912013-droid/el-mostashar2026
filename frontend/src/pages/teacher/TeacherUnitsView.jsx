import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import UnitCard from "../Student/UnitCard";
import "./TeacherUnitsView.css";

export default function TeacherUnitsView({ units, gradeId, subjectId }) {
  const addUnit = async () => {
    await addDoc(collection(db, "units"), {
      title: "وحدة جديدة",
      gradeId,
      subjectId,
      order: units.length + 1,
      active: false,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <>
      <div className="teacher-actions">
        <button className="add-btn" onClick={addUnit}>
          + إضافة وحدة
        </button>
      </div>

      <div className="units-grid">
        {units.map((unit, i) => (
          <UnitCard key={unit.id} unit={unit} index={i} />
        ))}
      </div>
    </>
  );
}
