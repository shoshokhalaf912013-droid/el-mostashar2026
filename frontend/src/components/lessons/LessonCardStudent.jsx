import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonCard.css";

export default function LessonCardStudent({ lesson, index }) {
  const navigate = useNavigate();
  const { gradeId, subjectId, unitId } = useParams();

  const goToLesson = () => {
    navigate(
      `/student/secondary/lesson/${gradeId}/${subjectId}/${unitId}/${lesson.id}`
    );
  };

  return (
    <div className="lesson-card">
      {/* رقم الدرس */}
      <div className="lesson-index">{index + 1}</div>

      {/* صندوق العنوان */}
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

        <span className="lesson-shooting" />
      </div>
    </div>
  );
}

LessonCardStudent.propTypes = {
  lesson: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};
