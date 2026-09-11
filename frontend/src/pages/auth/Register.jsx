import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        role: "student",
      });

      // 🔥 التحويل الصحيح لمسار لوج ان الخاص بالأوث
      navigate("/auth/login");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التسجيل");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">تسجيل حساب جديد</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">البريد الإلكتروني</label>
          <input
            type="email"
            className="border rounded p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">كلمة المرور</label>
          <input
            type="password"
            className="border rounded p-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          تسجيل
        </button>
      </form>
    </div>
  );
}
