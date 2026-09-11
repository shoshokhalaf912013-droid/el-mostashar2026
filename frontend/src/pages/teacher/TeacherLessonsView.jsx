import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import LessonCard from "../Student/LessonCard";
import "./TeacherLessonsView.css";

export default function TeacherLessonsView({
  lessons,
  gradeId,
  subjectId,
  unitId,
}) {
  const addLesson = async () => {
    await addDoc(collection(db, "lessons"), {
      title: "درس جديد",
      gradeId,
      subjectId,
      unitId,
      order: lessons.length + 1,
      active: false,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <>
      <div className="teacher-actions">
        <button className="add-btn" onClick={addLesson}>
          + إضافة درس
        </button>
      </div>

      <div className="lessons-list">
        {lessons.map((lesson, i) => (
          <LessonCard key={lesson.id} lesson={lesson} index={i} />
        ))}
      </div>
    </>
  );
}
