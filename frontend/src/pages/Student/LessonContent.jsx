import { useState, useRef } from "react";
import { storage } from "../../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

export default function LessonContent() {

  /* =========================
     STATES
  ========================= */

  const [videoURL, setVideoURL] = useState(null);
  const [pdfURL, setPdfURL] = useState(null);

  const [videoProgress, setVideoProgress] = useState(0);
  const [pdfProgress, setPdfProgress] = useState(0);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  const videoInput = useRef();
  const pdfInput = useRef();

  /* =========================
     VIDEO UPLOAD
  ========================= */

  const uploadVideo = (file) => {
    if (!file) return;

    setUploadingVideo(true);

    const storageRef = ref(
      storage,
      `lessons/videos/${Date.now()}_${file.name}`
    );

    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setVideoProgress(Math.round(progress));
      },
      (error) => {
        console.error(error);
        setUploadingVideo(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setVideoURL(url);
        setUploadingVideo(false);
      }
    );
  };

  /* =========================
     PDF UPLOAD
  ========================= */

  const uploadPDF = (file) => {
    if (!file) return;

    setUploadingPDF(true);

    const storageRef = ref(
      storage,
      `lessons/pdfs/${Date.now()}_${file.name}`
    );

    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setPdfProgress(Math.round(progress));
      },
      (error) => {
        console.error(error);
        setUploadingPDF(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setPdfURL(url);
        setUploadingPDF(false);
      }
    );
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="lesson-page">

      <h2>التركيب العام للخلية</h2>

      {/* ================= VIDEO ================= */}

      <div className="section">

        <h3>🎬 فيديو</h3>

        <button onClick={() => videoInput.current.click()}>
          رفع فيديو
        </button>

        <input
          type="file"
          accept="video/*"
          hidden
          ref={videoInput}
          onChange={(e) => uploadVideo(e.target.files[0])}
        />

        {uploadingVideo && (
          <div className="progressBox">
            <div
              className="progressBar"
              style={{ width: `${videoProgress}%` }}
            />
            <span>{videoProgress}%</span>
          </div>
        )}

        {videoURL && (
          <video
            controls
            width="100%"
            src={videoURL}
          />
        )}

      </div>

      {/* ================= PDF ================= */}

      <div className="section">

        <h3>📄 PDF</h3>

        <button onClick={() => pdfInput.current.click()}>
          رفع PDF
        </button>

        <input
          type="file"
          accept="application/pdf"
          hidden
          ref={pdfInput}
          onChange={(e) => uploadPDF(e.target.files[0])}
        />

        {uploadingPDF && (
          <div className="progressBox">
            <div
              className="progressBar"
              style={{ width: `${pdfProgress}%` }}
            />
            <span>{pdfProgress}%</span>
          </div>
        )}

        {pdfURL && (
          <iframe
            title="PDF"
            src={pdfURL}
            width="100%"
            height="500px"
          />
        )}

      </div>

    </div>
  );
}
