import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonCard.css";

export default function LessonCardSuper({ lesson, index, onDelete }) {
  const navigate = useNavigate();
  const { gradeId, subjectId, unitId } = useParams();

  const goToLesson = () => {
    navigate(
      `/student/secondary/lesson/${gradeId}/${subjectId}/${unitId}/${lesson.id}`
    );
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا الدرس؟");
    if (confirmDelete && onDelete) {
      onDelete(lesson.id);
    }
  };

  return (
    <div className="lesson-card">
      {/* رقم الدرس */}
      <div className="lesson-index">{index + 1}</div>

      <div
        className="lesson-title-box"
        style={{ animationDelay: `${index * 6}s` }}
      >
        <span className="lesson-title">{lesson.title}</span>

        <button
          className="start-lesson-btn"
          onClick={goToLesson}
        >
          ▶ ابدأ
        </button>

        <button
          className="delete-lesson-btn"
          onClick={handleDelete}
          title="حذف الدرس"
        >
          🗑️
        </button>

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
