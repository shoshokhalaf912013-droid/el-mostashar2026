import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { lessonRef } from "@/utils/lessonRef";

export default function LessonVideo() {

  const { gradeId, subjectId, unitId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = React.useState(null);

  React.useEffect(() => {

    const loadLesson = async () => {

      const refDoc = lessonRef(
        gradeId,
        subjectId,
        unitId,
        lessonId
      );

      const snap = await getDoc(refDoc);

      if (snap.exists()) setLesson(snap.data());
    };

    loadLesson();

  }, [gradeId, subjectId, unitId, lessonId]);

  if (!lesson) return <p>جارِ التحميل...</p>;

  return (
    <video src={lesson.videoUrl} controls />
  );
}