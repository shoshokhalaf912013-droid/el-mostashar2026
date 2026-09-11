// ======================
//  LessonViewer.jsx
// ======================
import "../../styles/lesson-viewer.css";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { db } from "../../firebase.js";

export default function LessonViewer() {
  const { currentUser } = useAuth();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        const ref = doc(db, "lessons", lessonId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setLesson(snap.data());
        } else {
          console.log("❌ الدرس غير موجود!");
        }
      } catch (err) {
        console.error("🔥 خطأ أثناء تحميل الدرس:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="p-4 text-yellow-400 text-lg">
        ⏳ جاري تحميل محتوى الدرس...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-4 text-red-500 text-lg">
        ❌ لم يتم العثور على الدرس!
      </div>
    );
  }

  return (
    <div className="lesson-container p-4">
      <h1 className="lesson-title">{lesson.title}</h1>

      {/* عرض محتوى الدرس كـ HTML */}
      <div
        className="lesson-content"
        dangerouslySetInnerHTML={{ __html: lesson.content || "" }}
      />
    </div>
  );
}
