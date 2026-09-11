import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminUploadLesson() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title || !description) {
      alert("⚠️ يرجى إدخال العنوان والوصف.");
      return;
    }

    setLoading(true);
    let pdfURL = null;

    try {
      if (pdfFile) {
        const storageRef = ref(storage, `lessonsPDF/${pdfFile.name}`);
        await uploadBytes(storageRef, pdfFile);
        pdfURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "lessons"), {
        title,
        description,
        videoURL,
        pdfURL,
        createdAt: new Date(),
      });

      alert("🎉 تم رفع الدرس بنجاح!");
      setTitle("");
      setDescription("");
      setVideoURL("");
      setPdfFile(null);

    } catch (error) {
      console.error("❌ Upload Error:", error);
      alert("⚠️ حدث خطأ أثناء رفع الدرس.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-[#111] p-6 rounded-2xl shadow-lg border border-yellow-600 mt-8">
      <h1 className="text-2xl text-center font-bold text-[var(--gold)]">
        📤 إضافة درس جديد
      </h1>

      <div className="mt-4 space-y-4 text-right">

        <input
          type="text"
          className="input"
          placeholder="📌 عنوان الدرس"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="input"
          placeholder="📝 وصف الدرس"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          type="text"
          className="input"
          placeholder="📺 رابط الفيديو (يوتيوب أو Google Drive)"
          value={videoURL}
          onChange={e => setVideoURL(e.target.value)}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={e => setPdfFile(e.target.files[0])}
          className="text-gray-300"
        />

        <button
          disabled={loading}
          onClick={handleUpload}
          className="bg-green-600 hover:bg-green-700 w-full py-3 text-lg rounded-xl font-bold text-white mt-3"
        >
          {loading ? "⏳ جاري الرفع..." : "📤 رفع الدرس"}
        </button>
      </div>
    </div>
  );
}
