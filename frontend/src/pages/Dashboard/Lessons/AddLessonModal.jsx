import { useState } from "react";
import "./AddLessonModal.css";

/* ===============================
   🔁 YouTube URL Normalizer
================================ */
function normalizeYoutubeUrl(url) {
  if (!url) return "";

  // already embed
  if (url.includes("youtube.com/embed")) return url;

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // youtube.com/watch?v=VIDEO_ID
  const longMatch = url.match(/[?&]v=([^?&]+)/);
  if (longMatch) {
    return `https://www.youtube.com/embed/${longMatch[1]}`;
  }

  return url; // fallback
}

export default function AddLessonModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      setError("عنوان الدرس مطلوب");
      return;
    }

    const lessonData = {
      title: title.trim(),
      lessonOrder: Number(order) || 0,
      videoUrl: normalizeYoutubeUrl(videoUrl),
      description: description.trim(),
      pdfFile,
    };

    onSave?.(lessonData);
  };

  return (
    <div className="add-lesson-modal">
      <div className="add-lesson-card">

        <h2 className="add-lesson-title">إضافة درس جديد</h2>

        {error && <div className="add-lesson-error">{error}</div>}

        <input
          type="text"
          className="add-lesson-field"
          placeholder="عنوان الدرس"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          className="add-lesson-field"
          placeholder="ترتيب الدرس"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        />

        <input
          type="text"
          className="add-lesson-field"
          placeholder="رابط الفيديو (YouTube)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <div className="add-lesson-helper">
          يمكنك لصق أي رابط يوتيوب وسيتم تحويله تلقائيًا
          <br />
          <span className="add-lesson-embed">
            https://www.youtube.com/watch?v=VIDEO_ID
          </span>
        </div>

        <textarea
          className="add-lesson-field add-lesson-textarea"
          placeholder="مقدمة أو شرح نصي (اختياري)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="add-lesson-pdf">
          📄 إضافة ملف PDF (اختياري)
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
        </label>

        <div className="add-lesson-actions">
          <button className="add-lesson-save" onClick={handleSave}>
            حفظ
          </button>
          <button className="add-lesson-cancel" onClick={onClose}>
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
}
