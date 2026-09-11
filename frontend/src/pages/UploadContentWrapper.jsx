import React, { useState } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendTeacherUploadNotification } from "../utils/emailHandler";

export default function UploadContentWrapper() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("pdf");
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return setStatus("❌ يرجى اختيار ملف أولاً");

    try {
      setStatus("🔄 جاري رفع الملف...");

      const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const contentRef = doc(db, "contents", Date.now().toString());
      await setDoc(contentRef, {
        type,
        url,
        createdAt: serverTimestamp(),
      });

      // 📧 إرسال نسخة للمدير
      await sendTeacherUploadNotification(type, url);

      setStatus("✅ تم الرفع بنجاح وإرسال نسخة للإدارة");
      setFile(null);

    } catch (error) {
      console.error(error);
      setStatus("❌ حدث خطأ أثناء الرفع");
    }
  };

  return (
    <div className="bg-black p-6 rounded-xl border border-yellow-600">
      <h2 className="text-xl text-yellow-400 font-bold mb-4">📤 رفع محتوى جديد</h2>

      <select
        className="w-full p-3 mb-3 bg-[#222] border border-gray-500 text-white rounded-lg"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="pdf">📄 PDF</option>
        <option value="video">🎬 فيديو</option>
        <option value="image">🖼 صور</option>
        <option value="exam">📝 اختبار</option>
      </select>

      <input
        type="file"
        className="mb-4 text-white"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-3 rounded-xl w-full"
      >
        رفع الآن
      </button>

      {status && <p className="mt-4 text-yellow-400">{status}</p>}
    </div>
  );
}
