// =======================================
//        LESSON FORM (FULL VERSION)
// =======================================

import { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { initializeApp } from "firebase/app";

// ================= FIREBASE CONFIG =================
// استخدم نفس بياناتك الحالية
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "XXXX",
  appId: "XXXX",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ===================================================

export default function LessonForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [videoSource, setVideoSource] = useState("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [flow, setFlow] = useState([]);

  // ======================================
  //        VIDEO UPLOAD FUNCTION
  // ======================================
  const uploadVideo = () => {
    return new Promise((resolve, reject) => {
      if (!videoFile) return resolve(null);

      const videoRef = ref(
        storage,
        `lessons/videos/${Date.now()}_${videoFile.name}`
      );

      const uploadTask = uploadBytesResumable(videoRef, videoFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          setUploadProgress(Math.round(progress));
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(
            uploadTask.snapshot.ref
          );
          resolve(downloadURL);
        }
      );
    });
  };

  // ======================================
  //          ADD VIDEO TO FLOW
  // ======================================
  const handleAddVideo = async () => {
    let finalVideoUrl = videoUrl;

    if (videoSource === "upload") {
      finalVideoUrl = await uploadVideo();
    }

    if (!finalVideoUrl) {
      alert("يجب إدخال رابط أو رفع فيديو");
      return;
    }

    const newItem = {
      order: flow.length + 1,
      type: "video",
      source: videoSource,
      videoUrl: finalVideoUrl,
    };

    setFlow([...flow, newItem]);

    setVideoUrl("");
    setVideoFile(null);
    setUploadProgress(0);
  };

  // ======================================
  //          SAVE LESSON
  // ======================================
  const handleSaveLesson = async () => {
    const lessonData = {
      title,
      description,
      active: true,
      flow,
    };

    console.log("LESSON DATA:", lessonData);

    alert("تم تجهيز الدرس (راجع console)");
  };

  // ======================================
  //                UI
  // ======================================
  return (
    <div style={{ padding: 30, maxWidth: 700 }}>
      <h2>إنشاء درس جديد</h2>

      {/* TITLE */}
      <input
        placeholder="عنوان الدرس"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="وصف الدرس"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...inputStyle, height: 100 }}
      />

      <hr />

      <h3>إضافة فيديو</h3>

      {/* SOURCE SELECT */}
      <select
        value={videoSource}
        onChange={(e) => setVideoSource(e.target.value)}
        style={inputStyle}
      >
        <option value="url">فيديو عبر رابط</option>
        <option value="upload">رفع فيديو</option>
      </select>

      {/* URL MODE */}
      {videoSource === "url" && (
        <input
          placeholder="رابط الفيديو"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={inputStyle}
        />
      )}

      {/* UPLOAD MODE */}
      {videoSource === "upload" && (
        <>
          <label style={uploadBtn}>
            📹 اختر فيديو
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </label>

          {videoFile && <p>✅ {videoFile.name}</p>}

          {uploadProgress > 0 && (
            <div style={progressBar}>
              <div
                style={{
                  ...progressFill,
                  width: `${uploadProgress}%`,
                }}
              />
            </div>
          )}
        </>
      )}

      <button style={btn} onClick={handleAddVideo}>
        إضافة الفيديو إلى الدرس
      </button>

      <hr />

      <h3>Flow الحالي</h3>

      {flow.map((item) => (
        <div key={item.order} style={flowItem}>
          #{item.order} — {item.source}
        </div>
      ))}

      <button style={saveBtn} onClick={handleSaveLesson}>
        حفظ الدرس
      </button>
    </div>
  );
}

// ================= STYLES =================

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btn = {
  marginTop: 15,
  padding: "10px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const saveBtn = {
  ...btn,
  background: "#16a34a",
};

const uploadBtn = {
  display: "inline-block",
  padding: "10px 15px",
  background: "#111827",
  color: "#fff",
  borderRadius: 6,
  cursor: "pointer",
  marginTop: 10,
};

const progressBar = {
  width: "100%",
  height: 10,
  background: "#e5e7eb",
  marginTop: 10,
  borderRadius: 10,
};

const progressFill = {
  height: "100%",
  background: "#22c55e",
  borderRadius: 10,
};

const flowItem = {
  padding: 10,
  background: "#f3f4f6",
  marginTop: 5,
  borderRadius: 6,
};
