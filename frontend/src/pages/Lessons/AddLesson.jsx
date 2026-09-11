import React, { useState } from "react";
import { db, storage } from "../../firebase"; // ✅ المسار الصحيح
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export default function AddLesson() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [videoType, setVideoType] = useState("none");
  const [videoURL, setVideoURL] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // ==============================
  // رفع أي ملف على Firebase Storage
  // ==============================
  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // ==============================
  // حفظ الدرس
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("⚠️ عنوان الدرس مطلوب");
      return;
    }

    if (!user) {
      alert("⚠️ يجب تسجيل الدخول كمعلم");
      return;
    }

    setLoading(true);

    try {
      let pdfUrl = "";
      let imageUrl = "";
      let finalVideoUrl = "";

      // 📄 PDF
      if (pdfFile) {
        pdfUrl = await uploadFile(
          pdfFile,
          `lessons/pdf/${Date.now()}-${pdfFile.name}`
        );
      }

      // 🖼 صورة
      if (imageFile) {
        imageUrl = await uploadFile(
          imageFile,
          `lessons/images/${Date.now()}-${imageFile.name}`
        );
      }

      // 🎬 فيديو
      if (videoType === "upload" && videoFile) {
        finalVideoUrl = await uploadFile(
          videoFile,
          `lessons/videos/${Date.now()}-${videoFile.name}`
        );
      }

      if (videoType === "youtube") {
        finalVideoUrl = videoURL.trim();
      }

      // 🔥 الحفظ النهائي في Firestore
      await addDoc(collection(db, "lessons"), {
        title,
        description,
        pdfUrl,
        imageUrl,
        videoUrl: finalVideoUrl,
        videoType,
        teacherId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert("✅ تم إضافة الدرس بنجاح");

      // إعادة التهيئة
      setTitle("");
      setDescription("");
      setPdfFile(null);
      setImageFile(null);
      setVideoURL("");
      setVideoFile(null);
      setVideoType("none");
    } catch (error) {
      console.error("ADD LESSON ERROR:", error);
      alert("❌ حدث خطأ أثناء إضافة الدرس");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-[#111] text-white rounded-lg border border-yellow-600 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">
        ➕ إضافة درس جديد
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="عنوان الدرس"
          className="w-full p-2 rounded bg-black border border-yellow-600"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="وصف الدرس (اختياري)"
          className="w-full p-2 h-28 rounded bg-black border border-yellow-600"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>📄 ملف PDF (اختياري)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />

        <label className="block">🎬 نوع الفيديو</label>
        <select
          className="w-full p-2 bg-black border border-yellow-600 rounded"
          value={videoType}
          onChange={(e) => setVideoType(e.target.value)}
        >
          <option value="none">بدون فيديو</option>
          <option value="youtube">رابط يوتيوب</option>
          <option value="upload">رفع فيديو</option>
        </select>

        {videoType === "youtube" && (
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full p-2 rounded bg-black border border-yellow-600"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
          />
        )}

        {videoType === "upload" && (
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        )}

        <label>🖼 صورة الدرس (اختياري)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-yellow-600 text-black font-bold p-3 rounded hover:bg-yellow-700"
        >
          {loading ? "⏳ جاري الحفظ..." : "إضافة الدرس"}
        </button>
      </form>
    </div>
  );
}
