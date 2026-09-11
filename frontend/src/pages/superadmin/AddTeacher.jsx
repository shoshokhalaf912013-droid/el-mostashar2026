import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddTeacher() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!name || !subject || !email) {
      alert("⚠️ من فضلك أكمل جميع الحقول");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "teachers"), {
        name,
        subject,
        email,
        createdAt: Date.now(),
      });

      setLoading(false);
      alert("✅ تم إضافة المدرس بنجاح");

      setName("");
      setSubject("");
      setEmail("");
    } catch (error) {
      alert("❌ خطأ: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-12">
      <h1 className="text-4xl font-bold text-yellow-500 mb-10 drop-shadow-lg">
        ➕ إضافة مدرس جديد
      </h1>

      <div className="bg-[#0d0d0d] border-4 border-yellow-600 rounded-2xl p-10 w-full max-w-2xl shadow-[0_0_25px_#ffdb4d]">
        <form onSubmit={handleAddTeacher} className="flex flex-col gap-6">

          <div>
            <label className="block mb-2 text-lg">اسم المدرس</label>
            <input
              type="text"
              className="w-full p-3 rounded bg-black border border-yellow-600 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسم المدرس..."
            />
          </div>

          <div>
            <label className="block mb-2 text-lg">المادة</label>
            <input
              type="text"
              className="w-full p-3 rounded bg-black border border-yellow-600 focus:outline-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="اكتب اسم المادة..."
            />
          </div>

          <div>
            <label className="block mb-2 text-lg">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full p-3 rounded bg-black border border-yellow-600 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="اكتب البريد الإلكتروني..."
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg text-xl transition-all duration-200"
            disabled={loading}
          >
            {loading ? "جارٍ الإضافة..." : "➕ إضافة المدرس"}
          </button>
        </form>
      </div>
    </div>
  );
}
