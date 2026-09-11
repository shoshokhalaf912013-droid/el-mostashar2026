import React, { useState } from "react";
import axios from "axios";
import { auth } from "../../firebase"; // ✅ إضافة آمنة

const AddLesson = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [pdf, setPdf] = useState(null);
  const [video, setVideo] = useState(null);
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("غير مسجل دخول");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);

    // ✅ الربط الأساسي
    formData.append("teacherId", user.uid);

    if (pdf) formData.append("pdf", pdf);
    if (video) formData.append("video", video);
    if (image) formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/api/lessons", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("تمت إضافة الدرس بنجاح");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء رفع الدرس");
    }
  };

  return (
    <div style={{
      background: "#000",
      color: "#FFD700",
      minHeight: "100vh",
      padding: "40px"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>إضافة درس جديد</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",
          margin: "auto",
          background: "#111",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid #FFD700"
        }}
      >
        <label>عنوان الدرس</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            width: "100%", padding: "10px",
            margin: "8px 0 20px 0",
            background: "#000",
            color: "#FFD700",
            border: "1px solid #FFD700",
            borderRadius: "6px"
          }}
        />

        <label>وصف الدرس</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          style={{
            width: "100%", padding: "10px",
            margin: "8px 0 20px 0",
            background: "#000",
            color: "#FFD700",
            border: "1px solid #FFD700",
            borderRadius: "6px"
          }}
        />

        <label>رفع ملف PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0])}
          style={{ marginBottom: "20px" }}
        />

        <label>رفع فيديو</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          style={{ marginBottom: "20px" }}
        />

        <label>رفع صورة</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginBottom: "20px" }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#FFD700",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          إضافة الدرس
        </button>
      </form>
    </div>
  );
};

export default AddLesson;
