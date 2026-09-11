import { useState } from "react";
import AddLessonModal from "./AddLessonModal";

export default function AddLessonButton({ gradeId, subjectId, unitId }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="add-lesson-btn"
        onClick={() => setOpen(true)}
      >
        + إضافة درس
      </button>

      {open && (
        <AddLessonModal
          gradeId={gradeId}
          subjectId={subjectId}
          unitId={unitId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
