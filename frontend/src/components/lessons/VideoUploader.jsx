import { useState } from "react";
import { motion } from "framer-motion";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "./VideoUploader.css";

export default function VideoUploader({ onChange }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const storage = getStorage();

  const handleFile = (file) => {
    if (!file) return;

    const videoRef = ref(
      storage,
      `lessons/videos/${Date.now()}-${file.name}`
    );

    setUploading(true);
    setProgress(100);

    const task = uploadBytesResumable(videoRef, file);

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
        console.error("Video upload error:", error);
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
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleUrlSubmit = () => {
    if (!videoUrlInput.trim()) return;
    onChange?.(videoUrlInput.trim());
    setVideoUrlInput("");
  };

  return (
    <div className="video-uploader-card">
      <h4 className="video-title">🎬 فيديو الدرس</h4>

      {/* Drag Area */}
      <div
        className={`video-drop-zone ${dragging ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p>اسحب الفيديو هنا أو اختر ملف</p>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Progress */}
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

      {/* OR */}
      <div className="video-or">أو</div>

      {/* URL */}
      <div className="video-url">
        <input
          type="text"
          placeholder="رابط فيديو (YouTube أو مباشر)"
          value={videoUrlInput}
          onChange={(e) => setVideoUrlInput(e.target.value)}
        />
        <button onClick={handleUrlSubmit}>اعتماد الرابط</button>
      </div>
    </div>
  );
}
