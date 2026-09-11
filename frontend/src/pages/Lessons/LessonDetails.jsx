import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function LessonDetails() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonRef = doc(db, "lessons", lessonId);
        const lessonSnap = await getDoc(lessonRef);

        if (!lessonSnap.exists()) {
          setError("الدرس غير موجود");
        } else {
          setLesson(lessonSnap.data());
        }
      } catch (err) {
        console.error("FETCH LESSON ERROR:", err);
        setError("حدث خطأ أثناء تحميل الدرس");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return <p style={{ padding: "30px" }}>⏳ جاري تحميل الدرس...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: "30px", color: "red" }}>
        ❌ {error}
      </p>
    );
  }

  if (!lesson) {
    return <p style={{ padding: "30px" }}>❌ الدرس غير متاح</p>;
  }

  // تحويل روابط يوتيوب إلى Embed
  const getEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }

    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  };

  const videoUrl = lesson.videoUrl
    ? getEmbedUrl(lesson.videoUrl)
    : null;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ marginBottom: "20px" }}>{lesson.title}</h1>

      {lesson.description && (
        <p style={{ marginBottom: "20px", color: "#ccc" }}>
          {lesson.description}
        </p>
      )}

      {/* 🎬 فيديو */}
      {videoUrl && (
        <div style={{ marginBottom: "30px" }}>
          <iframe
            width="100%"
            height="450"
            src={videoUrl}
            title="Lesson Video"
            allowFullScreen
          />
        </div>
      )}

      {/* 🖼 صورة */}
      {!videoUrl && lesson.imageUrl && (
        <div style={{ marginBottom: "30px" }}>
          <img
            src={lesson.imageUrl}
            alt="Lesson"
            style={{ width: "100%", borderRadius: "10px" }}
          />
        </div>
      )}

      {/* 📄 PDF */}
      {lesson.pdfUrl && (
        <div>
          <a
            href={lesson.pdfUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              background: "#facc15",
              color: "#000",
              borderRadius: "6px",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            📄 فتح ملف الشرح (PDF)
          </a>
        </div>
      )}
    </div>
  );
}
