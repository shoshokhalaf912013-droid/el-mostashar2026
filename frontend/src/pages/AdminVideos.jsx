import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const res = await getDocs(collection(db, "videos"));
      setVideos(res.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchVideos();
  }, []);

  const deleteVideo = async (id) => {
    if (!window.confirm("❗ هل أنت متأكد من حذف الفيديو؟")) return;
    await deleteDoc(doc(db, "videos", id));
    setVideos(videos.filter((v) => v.id !== id));
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-yellow-400 text-2xl mb-4">🎥 إدارة الفيديوهات</h2>

      {videos.map((video) => (
        <div key={video.id} className="bg-gray-700 p-3 rounded flex justify-between mb-3">
          <span>{video.title}</span>
          <button onClick={() => deleteVideo(video.id)} className="bg-red-600 px-3 rounded">
            🗑 حذف
          </button>
        </div>
      ))}
    </div>
  );
}
