import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./styles/LessonFlow.css";

export default function LessonFlow() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const ref = doc(db, "lessons", lessonId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setLesson(snap.data());
        } else {
          setLesson(null);
        }
      } catch (e) {
        console.error(e);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return <div className="lesson-loading">جاري التحميل...</div>;
  }

  if (!lesson) {
    return <div className="lesson-empty">الدرس غير موجود</div>;
  }

  const flow = lesson.flow || [];

  const video = flow.find((f) => f.type === "video");
  const text = flow.find((f) => f.type === "text");
  const pdf = flow.find((f) => f.type === "pdf");

  return (
    <div className="lesson-flow-page">
      <div className="lesson-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← رجوع
        </button>
        <h2 className="lesson-title">{lesson.title}</h2>
      </div>

      {/* VIDEO */}
      <div className="lesson-section gold-box">
        <h3>📹 الفيديو</h3>

        {video?.videoUrl ? (
          <video
            className="lesson-video"
            controls
            playsInline
            preload="metadata"
          >
            <source src={video.videoUrl} />
          </video>
        ) : (
          <p>لا يوجد فيديو لهذا الدرس</p>
        )}
      </div>

      {/* TEXT */}
      <div className="lesson-section gold-box">
        <h3>📘 مقدمة</h3>
        {text?.content ? (
          <p className="lesson-text">{text.content}</p>
        ) : (
          <p>لا توجد مقدمة بعد</p>
        )}
      </div>

      {/* PDF */}
      <div className="lesson-section gold-box">
        <h3>📄 ملف PDF</h3>
        {pdf?.pdfUrl ? (
          <a
            href={pdf.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="pdf-btn"
          >
            فتح ملف PDF
          </a>
        ) : (
          <p>لا يوجد ملف PDF</p>
        )}
      </div>
    </div>
  );
}
