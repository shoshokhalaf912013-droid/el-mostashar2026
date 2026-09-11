import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import { db } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

import "./LessonCard.css";

export default function LessonCard({
  lesson,
  index,
  canEdit = false,
  canDelete = false
}) {

  const navigate = useNavigate();
  const { gradeId, subjectId, unitId } = useParams();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title || "درس جديد");

  /* ================= OPEN LESSON ================= */

  const goToLesson = () => {
    navigate(
      `/student/secondary/lesson/${gradeId}/${subjectId}/${unitId}/${lesson.id}`
    );
  };

  /* ================= EDIT ================= */

  const saveTitle = async () => {
    if (!title.trim()) return;

    try {
      await updateDoc(doc(db, "lessons", lesson.id), {
        title: title.trim()
      });

      setEditing(false);
    } catch (err) {
      console.error("Update lesson error:", err);
    }
  };

  /* ================= DELETE ================= */

  const deleteLesson = async (e) => {
    e.stopPropagation();

    const confirmDelete = window.confirm("هل تريد حذف الدرس؟");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "lessons", lesson.id));
    } catch (err) {
      console.error("Delete lesson error:", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="lesson-card" onClick={goToLesson}>

      {/* رقم الدرس */}
      <div className="lesson-index">
        {index + 1}
      </div>

      {/* أزرار التحكم */}
      {(canEdit || canDelete) && (
        <div
          className="lesson-actions"
          onClick={(e) => e.stopPropagation()}
        >
          {canEdit && (
            <button
              className="edit-btn"
              onClick={() => setEditing(true)}
            >
              ✏
            </button>
          )}

          {canDelete && (
            <button
              className="delete-btn"
              onClick={deleteLesson}
            >
              🗑
            </button>
          )}
        </div>
      )}

      {/* المحتوى */}
      <div className="lesson-content">

        {editing ? (
          <input
            className="lesson-edit-input"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
            }}
          />
        ) : (
          <h3 className="lesson-title">{title}</h3>
        )}

        <button
          className="start-btn"
          onClick={(e) => {
            e.stopPropagation();
            goToLesson();
          }}
        >
          ▶ ابدأ
        </button>

      </div>

    </div>
  );
}

LessonCard.propTypes = {
  lesson: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};
