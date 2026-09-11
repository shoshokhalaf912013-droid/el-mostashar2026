import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      const res = await getDocs(collection(db, "exams"));
      setExams(res.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchExams();
  }, []);

  const deleteExam = async (id) => {
    if (!window.confirm("⚠ حذف الامتحان نهائياً؟")) return;
    await deleteDoc(doc(db, "exams", id));
    setExams(exams.filter((ex) => ex.id !== id));
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-yellow-400 text-2xl mb-4">📑 إدارة الامتحانات</h2>

      {exams.map((ex) => (
        <div key={ex.id} className="bg-gray-700 p-3 rounded flex justify-between mb-3">
          <span>{ex.title}</span>
          <button onClick={() => deleteExam(ex.id)} className="bg-red-600 px-3 rounded">
            🗑 حذف
          </button>
        </div>
      ))}
    </div>
  );
}
