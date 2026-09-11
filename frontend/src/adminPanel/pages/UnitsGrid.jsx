import { useState } from "react";
import "./UnitsGrid.css";
import AddUnitModal from "./AddUnitModal";

export default function UnitsGrid() {
  // 🔒 بيانات مؤقتة (Local فقط)
  const [units, setUnits] = useState([
    {
      id: "u1",
      title: "الحركة في خط مستقيم",
      gradeId: "sec2",
      subjectId: "physics",
      order: 1,
      active: true,
    },
    {
      id: "u2",
      title: "قوانين نيوتن",
      gradeId: "sec2",
      subjectId: "physics",
      order: 2,
      active: true,
    },
  ]);

  function handleEdit(unit) {
    console.log("EDIT UNIT:", unit);
    alert(`تعديل الوحدة: ${unit.title}`);
  }

  function handleDelete(unitId) {
    const confirmDelete = window.confirm("هل تريد حذف هذه الوحدة؟");
    if (!confirmDelete) return;

    setUnits(units.filter((u) => u.id !== unitId));
  }

  return (
    <div className="units-wrapper">
      {/* زر إضافة وحدة */}
      <div className="units-header">
        <h1>إدارة الوحدات</h1>
        <AddUnitModal />
      </div>

      {/* Grid */}
      <div className="units-grid">
        {units.map((unit) => (
          <div className="unit-card" key={unit.id}>
            <div className="unit-info">
              <h3>{unit.title}</h3>
              <p>الصف: {unit.gradeId}</p>
              <p>المادة: {unit.subjectId}</p>
              <p>الترتيب: {unit.order}</p>
            </div>

            <div className="unit-actions">
              <button
                className="unit-edit"
                onClick={() => handleEdit(unit)}
              >
                ✒️
              </button>

              <button
                className="unit-delete"
                onClick={() => handleDelete(unit.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
