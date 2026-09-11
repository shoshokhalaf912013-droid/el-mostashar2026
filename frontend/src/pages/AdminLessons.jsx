import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      // التحقق من صلاحية الإدمن
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
        alert("🚫 غير مسموح لك بالدخول لهذه الصفحة.");
        navigate("/");
        return;
      }

      // جلب الدروس
      const querySnapshot = await getDocs(collection(db, "lessons"));
      const lessonList = [];
      querySnapshot.forEach((d) => lessonList.push({ id: d.id, ...d.data() }));

      setLessons(lessonList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);


  // حذف درس
  const deleteLesson = async (id) => {
    if (!window.confirm("⚠ هل أنت متأكد من حذف هذا الدرس؟")) return;
    await deleteDoc(doc(db, "lessons", id));
    setLessons(lessons.filter((lesson) => lesson.id !== id));
  };


  // إظهار/اخفاء درس
  const toggleVisibility = async (lesson) => {
    await updateDoc(doc(db, "lessons", lesson.id), {
      hidden: !lesson.hidden,
    });

    setLessons(
      lessons.map((l) => (l.id === lesson.id ? { ...l, hidden: !l.hidden } : l))
    );
  };

  if (loading) {
    return <p className="text-center text-white mt-10">⏳ جاري التحميل...</p>;
  }

  return (
    <div className="p-6 text-white max-w-3xl mx-auto bg-[#111] border border-yellow-600 rounded-xl mt-6">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
        🛠 إدارة الدروس
      </h2>

      {lessons.length === 0 ? (
        <p className="text-gray-300 text-center">⏳ لا يوجد دروس مضافة بعد.</p>
      ) : (
        <ul className="space-y-4">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex justify-between items-center bg-[#222] p-4 rounded-lg"
            >
              <div>
                <p className="font-bold text-yellow-400">{lesson.title}</p>
                <p className="text-sm text-gray-400">
                  {lesson.hidden ? "🚫 مخفي" : "📢 ظاهر للطلاب"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700"
                >
                  عرض
                </button>

                <button
                  onClick={() => toggleVisibility(lesson)}
                  className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-700"
                >
                  {lesson.hidden ? "🔓 إظهار" : "🚫 إخفاء"}
                </button>

                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
