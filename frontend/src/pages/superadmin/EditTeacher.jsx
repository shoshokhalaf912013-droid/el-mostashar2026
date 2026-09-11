import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function EditTeacher() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "teachers", id));
      if (snap.exists()) setTeacher(snap.data());
    };
    load();
  }, [id]);

  const updateTeacher = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "teachers", id), teacher);
    alert("✔ تم تحديث البيانات");
  };

  if (!teacher) return <p>تحميل...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl text-yellow-400 mb-4">✏ تعديل المدرس</h1>

      <form
        onSubmit={updateTeacher}
        className="bg-[#111] p-6 border border-yellow-600 rounded-xl w-96 flex flex-col gap-3"
      >
        <input
          type="text"
          value={teacher.name}
          className="p-2 bg-black border border-yellow-600 rounded"
          onChange={(e) => setTeacher({ ...teacher, name: e.target.value })}
        />

        <input
          type="text"
          value={teacher.subject}
          className="p-2 bg-black border border-yellow-600 rounded"
          onChange={(e) => setTeacher({ ...teacher, subject: e.target.value })}
        />

        <input
          type="email"
          value={teacher.email}
          className="p-2 bg-black border border-yellow-600 rounded"
          onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
        />

        <button className="bg-yellow-600 text-black rounded py-2 font-bold">
          حفظ التعديلات
        </button>
      </form>
    </div>
  );
}
