// src/pages/CourseLessons.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";

import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function CourseLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const u = auth.currentUser;
    if (u) setUserEmail(u.email);
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        // ▼▼ تم التعديل
        const q = query(collection(db, "lessons"), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setLessons(docs);
      } catch (err) {
        console.error("fetchLessons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const openLesson = (lesson) => {
    navigate(`/course/${courseId}/lesson/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-16 text-lg text-gray-300">
        ⏳ جاري تحميل الدروس...
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-white">
        لا توجد دروس مضافة بعد.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-400">📚 الدروس المتاحة</h1>

        {userEmail && (
          <div className="text-sm text-gray-300">مرحبًا — {userEmail}</div>
        )}
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <article
            key={lesson.id}
            className="bg-[#0b1114] border border-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-1">
                {lesson.title || "بدون عنوان"}
              </h3>

              <button
                onClick={() => openLesson(lesson)}
                className="mt-4 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded font-semibold"
              >
                عرض الدرس
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
