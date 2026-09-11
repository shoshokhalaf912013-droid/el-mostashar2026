import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

import { db, storage } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

/* ===============================
   LESSON FLOW
================================ */

export default function StudentLessonFlow() {

  const { gradeId, subjectId, unitId, lessonId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [pdfProgress, setPdfProgress] = useState(0);

  /* ================= PERMISSIONS ================= */

  const canEdit =
    role === "teacher" ||
    role === "admin" ||
    role === "super-admin";

  /* ================= LESSON REF ================= */

  const lessonRef = doc(
    db,
    "grades",
    gradeId,
    "subjects",
    subjectId,
    "units",
    unitId,
    "lessons",
    lessonId
  );

  /* ================= REALTIME LOAD ================= */

  useEffect(() => {

    const unsub = onSnapshot(
      lessonRef,
      (snap) => {
        if (snap.exists()) {
          setLesson({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsub();

  }, [lessonId]);

  /* ================= VIDEO UPLOAD ================= */

  const uploadVideo = (file) => {

    if (!file || !canEdit) return;

    const storageRef = ref(
      storage,
      `lessons/${lessonId}/video_${Date.now()}`
    );

    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const progress =
          (snap.bytesTransferred / snap.totalBytes) * 100;
        setVideoProgress(Math.round(progress));
      },
      console.error,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);

        await updateDoc(lessonRef, {
          videoUrl: url
        });
      }
    );
  };

  /* ================= PDF UPLOAD ================= */

  const uploadPDF = (file) => {

    if (!file || !canEdit) return;

    const storageRef = ref(
      storage,
      `lessons/${lessonId}/pdf_${Date.now()}`
    );

    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const progress =
          (snap.bytesTransferred / snap.totalBytes) * 100;
        setPdfProgress(Math.round(progress));
      },
      console.error,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);

        await updateDoc(lessonRef, {
          pdfUrl: url
        });
      }
    );
  };

  /* ================= LOADING ================= */

  if (loading)
    return <div className="lesson-container">Loading...</div>;

  if (!lesson)
    return <div className="lesson-container">الدرس غير موجود</div>;

  /* ================= UI ================= */

  return (
    <div className="lesson-container">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← رجوع
      </button>

      <h2 className="lesson-title">{lesson.title}</h2>

      {/* ================= VIDEO ================= */}

      <div className="lesson-box">

        <div className="lesson-box-header">
          🎬 فيديو الدرس
        </div>

        {lesson.videoUrl ? (
          <video
            src={lesson.videoUrl}
            controls
            className="lesson-video"
          />
        ) : (
          <p className="empty-text">لا يوجد فيديو بعد</p>
        )}

        {canEdit && (
          <>
            <label className="upload-btn">
              رفع فيديو
              <input
                hidden
                type="file"
                accept="video/*"
                onChange={(e)=>uploadVideo(e.target.files[0])}
              />
            </label>

            <p>{videoProgress}%</p>
          </>
        )}

      </div>

      {/* ================= PDF ================= */}

      <div className="lesson-box">

        <div className="lesson-box-header">
          📄 ملف PDF
        </div>

        {lesson.pdfUrl ? (
          <a
            href={lesson.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="pdf-btn"
          >
            فتح الملف
          </a>
        ) : (
          <p className="empty-text">لا يوجد ملف بعد</p>
        )}

        {canEdit && (
          <>
            <label className="upload-btn">
              رفع PDF
              <input
                hidden
                type="file"
                accept="application/pdf"
                onChange={(e)=>uploadPDF(e.target.files[0])}
              />
            </label>

            <p>{pdfProgress}%</p>
          </>
        )}

      </div>

    </div>
  );
}