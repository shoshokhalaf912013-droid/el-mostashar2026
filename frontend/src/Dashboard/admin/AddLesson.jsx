import React, { useState } from "react";
import { db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default function AddLesson() {

  const [title, setTitle] = useState("");
  const [youtube, setYoutube] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [progress, setProgress] = useState(0);

  /* =========================
     تحويل يوتيوب → Embed
  ========================= */
  const convertYoutube = (url) => {
    const id = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  };

  /* =========================
     رفع ملف بالخلفية
  ========================= */
  const uploadFile = (file, path) =>
    new Promise((resolve) => {

      const storageRef = ref(storage, path);
      const uploadTask =
        uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog =
            (snapshot.bytesTransferred /
              snapshot.totalBytes) *
            100;

          setProgress(Math.round(prog));
        },
        console.error,
        async () => {
          const url =
            await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

  /* =========================
     حفظ الدرس
  ========================= */
  const handleSave = async () => {

    let videoUrl = "";
    let videoType = "";

    // Youtube
    if (youtube) {
      videoType = "youtube";
      videoUrl = convertYoutube(youtube);
    }

    // Upload Video
    if (videoFile) {
      videoType = "upload";
      videoUrl = await uploadFile(
        videoFile,
        `videos/${Date.now()}_${videoFile.name}`
      );
    }

    // Upload PDF
    let pdfUrl = "";
    if (pdfFile) {
      pdfUrl = await uploadFile(
        pdfFile,
        `pdfs/${Date.now()}_${pdfFile.name}`
      );
    }

    await addDoc(collection(db, "lessons"), {
      title,
      videoType,
      videoUrl,
      pdfUrl,

      gradeId: "sec3",
      subjectId: "history",
      unitId: "unit-1",

      lessonOrder: Date.now(),

      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    alert("✅ تم إضافة الدرس بنجاح");
  };

  return (
    <div className="admin-add-lesson">

      <h2>إضافة درس جديد</h2>

      <input
        placeholder="عنوان الدرس"
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="رابط يوتيوب"
        onChange={(e) => setYoutube(e.target.value)}
      />

      <input
        type="file"
        accept="video/*"
        onChange={(e) =>
          setVideoFile(e.target.files[0])
        }
      />

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setPdfFile(e.target.files[0])
        }
      />

      {progress > 0 && (
        <p>جاري الرفع: {progress}%</p>
      )}

      <button onClick={handleSave}>
        حفظ الدرس
      </button>

    </div>
  );
}
