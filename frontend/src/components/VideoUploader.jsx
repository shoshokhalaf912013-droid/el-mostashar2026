import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export default function VideoUploader() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    if (!file) return alert("اختر ملفًا");
    const id = uuidv4();
    const storageRef = ref(storage, `videos/${id}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', snapshot => {
      setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
    }, err => alert(err.message), async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      alert("تم رفع الفيديو. رابط مشفر مؤقت يجب إنشاؤه من backend: " + url);
      setProgress(0); setFile(null);
    });
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="video/*" onChange={e=>setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="btn-gold">رفع الفيديو</button>
      {progress>0 && <div>تقدم الرفع: {progress}%</div>}
    </div>
  );
}
