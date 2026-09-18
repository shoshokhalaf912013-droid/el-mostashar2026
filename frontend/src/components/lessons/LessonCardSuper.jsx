import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./LessonCard.css";

export default function LessonCardSuper({
  lesson,
  index,
  onDelete,
}) {
  const navigate = useNavigate();
  const { gradeId, subjectId, unitId } = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(
    lesson.title || ""
  );
  const [savingTitle, setSavingTitle] = useState(false);

  const [displayTitle, setDisplayTitle] = useState(
    lesson.title || ""
  );

  const goToLesson = () => {
    navigate(
      `/student/secondary/lesson/${gradeId}/${subjectId}/${unitId}/${lesson.id}`
    );
  };

  /* =========================
     بدء تعديل اسم الدرس
  ========================= */

  const startEditing = (e) => {
    e.stopPropagation();

    setEditedTitle(
      displayTitle || lesson.title || ""
    );

    setIsEditing(true);
  };

  /* =========================
     إلغاء التعديل
  ========================= */

  const cancelEditing = (e) => {
    e.stopPropagation();

    setEditedTitle(
      displayTitle || lesson.title || ""
    );

    setIsEditing(false);
  };

  /* =========================
     حفظ الاسم في Firestore
  ========================= */

  const saveLessonTitle = async (e) => {
    e.stopPropagation();

    const newTitle = editedTitle.trim();

    if (!newTitle) {
      alert("من فضلك أدخل اسم الدرس.");
      return;
    }

    if (!lesson.id) {
      alert("تعذر تحديد رقم الدرس.");
      return;
    }

    setSavingTitle(true);

    try {
      const lessonRef = doc(
        db,
        "lessons",
        String(lesson.id)
      );

      await updateDoc(lessonRef, {
        title: newTitle,
      });

      setDisplayTitle(newTitle);
      setEditedTitle(newTitle);
      setIsEditing(false);

      alert("تم تعديل اسم الدرس وحفظه بنجاح.");
    } catch (error) {
      console.error(
        "❌ Error updating lesson title:",
        error
      );

      alert(
        "حدث خطأ أثناء حفظ اسم الدرس. تأكد من صلاحيات Firestore."
      );
    } finally {
      setSavingTitle(false);
    }
  };

  /* =========================
     حذف الدرس
  ========================= */

  const handleDelete = (e) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف هذا الدرس؟"
    );

    if (
      confirmDelete &&
      onDelete
    ) {
      onDelete(lesson.id);
    }
  };

  return (
    <div className="lesson-card">
      {/* =========================
          رقم الدرس
      ========================= */}

      <div className="lesson-index">
        {index + 1}
      </div>

      {/* =========================
          محتوى الدرس
      ========================= */}

      <div
        className="lesson-title-box"
        style={{
          animationDelay: `${index * 6}s`,
        }}
      >
        {/* =========================
            اسم الدرس
        ========================= */}

        {isEditing ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <input
              type="text"
              value={editedTitle}
              onChange={(e) =>
                setEditedTitle(
                  e.target.value
                )
              }
              onClick={(e) =>
                e.stopPropagation()
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveLessonTitle(e);
                }

                if (e.key === "Escape") {
                  cancelEditing(e);
                }
              }}
              autoFocus
              disabled={savingTitle}
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "10px 14px",
                borderRadius: "8px",
                border:
                  "1px solid #ffd700",
                background: "#111",
                color: "#fff",
                textAlign: "center",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent:
                  "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={saveLessonTitle}
                disabled={savingTitle}
                style={{
                  padding:
                    "7px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    "#16a34a",
                  color: "#fff",
                  cursor: savingTitle
                    ? "not-allowed"
                    : "pointer",
                  opacity: savingTitle
                    ? 0.6
                    : 1,
                }}
              >
                {savingTitle
                  ? "⏳ جارٍ الحفظ..."
                  : "💾 حفظ"}
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                disabled={savingTitle}
                style={{
                  padding:
                    "7px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    "#555",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <span className="lesson-title">
            {displayTitle || "بدون اسم"}
          </span>
        )}

        {/* =========================
            ابدأ
        ========================= */}

        {!isEditing && (
          <button
            className="start-lesson-btn"
            onClick={goToLesson}
          >
            ▶ ابدأ
          </button>
        )}

        {/* =========================
            تعديل الاسم
        ========================= */}

        {!isEditing && (
          <button
            type="button"
            className="edit-lesson-btn"
            onClick={startEditing}
            title="تعديل اسم الدرس"
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border:
                "1px solid #3b82f6",
              background:
                "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ✏️ تعديل الاسم
          </button>
        )}

        {/* =========================
            حذف
        ========================= */}

        {!isEditing && (
          <button
            className="delete-lesson-btn"
            onClick={handleDelete}
            title="حذف الدرس"
          >
            🗑️
          </button>
        )}

        <span className="lesson-shooting" />
      </div>
    </div>
  );
}

LessonCardSuper.propTypes = {
  lesson: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
};