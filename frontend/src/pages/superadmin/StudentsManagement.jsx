import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function StudentsManagement() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);

    const studentsOnly = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "student");

    setStudents(studentsOnly);
  }

  async function promoteToTeacher(userId) {
    await updateDoc(doc(db, "users", userId), {
      role: "teacher",
    });

    setStudents((prev) =>
      prev.filter((u) => u.id !== userId)
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">
        👨‍🎓 إدارة الطلاب
      </h1>

      {students.length === 0 && (
        <p className="text-gray-400">لا يوجد طلاب حاليًا</p>
      )}

      <div className="space-y-4">
        {students.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <div>
              <p className="font-semibold">{s.email}</p>
              <p className="text-sm text-gray-400">طالب</p>
            </div>

            <button
              onClick={() => promoteToTeacher(s.id)}
              className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400"
            >
              ⬆️ ترقية إلى مدرس
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
