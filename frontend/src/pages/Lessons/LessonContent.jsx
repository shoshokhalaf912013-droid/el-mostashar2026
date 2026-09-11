import { useState } from "react";
import uploadManager from "../../services/uploadManager";
import "../../styles/lesson.css";

export default function LessonContent({ lessonId }) {
  /* =========================
        STATES
  ========================= */

  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const [videoURL, setVideoURL] = useState(null);
  const [pdfURL, setPdfURL] = useState(null);

  /* =========================
        UPLOAD HANDLER
  ========================= */

  const startUpload = (file, type) => {
    if (!file) return;

    setUploadStatus("جاري تجهيز الملف...");
    setUploadProgress(0);

    const path = `lessons/${lessonId}/${type}/${Date.now()}_${file.name}`;

    uploadManager.uploadFile({
      file,
      path,

      onProgress: (progress) => {
        setUploadStatus("جاري الرفع...");
        setUploadProgress(progress);
      },

      onSuccess: (url) => {
        setUploadStatus("تم الرفع بنجاح ✅");
        setUploadProgress(100);

        if (type === "videos") {
          setVideoURL(url);
        }

        if (type === "pdf") {
          setPdfURL(url);
        }

        /*
          هنا فقط تحفظ الرابط في Firestore لاحقاً
        */
        console.log("Uploaded URL:", url);
      },

      onError: (err) => {
        console.error(err);
        setUploadStatus("فشل الرفع ❌");
        setUploadProgress(null);
      },
    });
  };

  /* =========================
        UI
  ========================= */

  return (
    <div className="lesson-container">

      {/* ================= VIDEO ================= */}

      <div className="lesson-card">

        <h3>🎬 فيديو الدرس</h3>

        {videoURL ? (
          <video
            controls
            className="lesson-video"
            src={videoURL}
          />
        ) : (
          <label className="upload-btn">
            رفع فيديو
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) =>
                startUpload(e.target.files[0], "videos")
              }
            />
          </label>
        )}

      </div>

      {/* ================= PDF ================= */}

      <div className="lesson-card">

        <h3>📄 ملف PDF</h3>

        {pdfURL ? (
          <a
            href={pdfURL}
            target="_blank"
            rel="noreferrer"
            className="pdf-link"
          >
            فتح الملف
          </a>
        ) : (
          <label className="upload-btn">
            رفع PDF
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) =>
                startUpload(e.target.files[0], "pdf")
              }
            />
          </label>
        )}

      </div>

      {/* ================= PROGRESS ================= */}

      {uploadProgress !== null && (
        <div className="upload-progress">

          <p>{uploadStatus}</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <span>{uploadProgress}%</span>

        </div>
      )}

    </div>
  );
}
