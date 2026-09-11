import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase";

export default function TeachersTable() {
  const [teachers, setTeachers] = useState([]);

  /* ================================
     تحميل البيانات
  ================================= */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "teachers"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeachers(data);
      }
    );

    return () => unsubscribe();
  }, []);

  /* ================================
     تفعيل / تعطيل
  ================================= */
  const toggleActive = async (id, currentState) => {
    try {
      await updateDoc(doc(db, "teachers", id), {
        active: !currentState
      });
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التحديث");
    }
  };

  /* ================================
     حذف
  ================================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("هل أنت متأكد من الحذف؟");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "teachers", id));
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  if (teachers.length === 0) {
    return (
      <div className="text-gray-400 text-center py-10">
        لا يوجد معلمين حالياً
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-black border-b border-yellow-500/40 text-yellow-400">
            <th className="p-3 text-right">الاسم</th>
            <th className="p-3 text-right">البريد</th>
            <th className="p-3 text-right">المرحلة</th>
            <th className="p-3 text-right">النظام</th>
            <th className="p-3 text-right">الصف</th>
            <th className="p-3 text-right">المادة</th>
            <th className="p-3 text-right">الحالة</th>
            <th className="p-3 text-right">الإجراءات</th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((teacher) => (
            <tr
              key={teacher.id}
              className="border-b border-gray-800 hover:bg-black/40 transition"
            >
              <td className="p-3">{teacher.name}</td>
              <td className="p-3">{teacher.email}</td>
              <td className="p-3">{teacher.stageId}</td>
              <td className="p-3">{teacher.systemId || "-"}</td>
              <td className="p-3">{teacher.gradeId}</td>
              <td className="p-3">{teacher.subject}</td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    teacher.active
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {teacher.active ? "مفعل" : "غير مفعل"}
                </span>
              </td>

              <td className="p-3 space-x-2 space-x-reverse">
                <button
                  onClick={() =>
                    toggleActive(teacher.id, teacher.active)
                  }
                  className="px-3 py-1 rounded bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-300"
                >
                  {teacher.active ? "تعطيل" : "تفعيل"}
                </button>

                <button
                  onClick={() => handleDelete(teacher.id)}
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-500"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}