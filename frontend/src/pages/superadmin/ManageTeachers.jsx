import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snap) => {
      setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  const deleteTeacher = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف المدرس؟")) {
      await deleteDoc(doc(db, "teachers", id));
      alert("تم الحذف ✔");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl text-yellow-500 font-bold mb-10 text-center">
        📚 إدارة المدرسين
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="bg-[#0d0d0d] border border-yellow-600 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl text-yellow-400 mb-2">{t.name}</h2>
            <p className="text-gray-300">📘 المادة: {t.subject}</p>
            <p className="text-gray-400 mb-4">✉️ {t.email}</p>

            <button
              onClick={() => deleteTeacher(t.id)}
              className="mt-3 bg-red-600 hover:bg-red-500 w-full py-2 rounded-lg font-bold"
            >
              حذف ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
