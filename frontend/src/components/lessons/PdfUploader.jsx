import { useState } from "react";
import { motion } from "framer-motion";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "./PdfUploader.css";

export default function PdfUploader({ onChange }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [uploading, setUploading] = useState(false);

  const storage = getStorage();

  const handleFile = (file) => {
    if (!file || file.type !== "application/pdf") return;

    const pdfRef = ref(
      storage,
      `lessons/pdfs/${Date.now()}-${file.name}`
    );

    setUploading(true);
    setProgress(100);

    const task = uploadBytesResumable(pdfRef, file);

    task.on(
      "state_changed",
      (snapshot) => {
        const percent =
          100 -
          Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
        setProgress(percent);
      },
      (error) => {
        console.error("PDF upload error:", error);
        setUploading(false);
        setProgress(null);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setUploading(false);
        setProgress(null);
        onChange?.(url);
      }
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="pdf-uploader-card">
      <h4 className="pdf-title">📄 ملف PDF</h4>

      <div
        className={`pdf-drop-zone ${dragging ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p>اسحب ملف PDF هنا أو اختر ملف</p>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {uploading && (
        <div className="progress-wrapper">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              animate={{ width: `${100 - progress}%` }}
            />
          </div>
          <span className="progress-text">
            ⬇️ جارٍ الرفع… {progress}%
          </span>
        </div>
      )}
    </div>
  );
}
