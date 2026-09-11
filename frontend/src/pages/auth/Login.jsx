// src/pages/auth/Login.jsx  ← صحّح المسار عندك
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // db غير مستخدم فلا داعي له
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // بعد تسجيل الدخول — نعيد التوجيه للصفحة الرئيسية
      navigate("/"); // بدلاً من /home
    } catch (err) {
      setError("خطأ في البريد الإلكتروني أو كلمة المرور.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-purple-800">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
          تسجيل الدخول إلى منصة المستشار 2026
        </h2>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="border p-3 w-full mb-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          className="border p-3 w-full mb-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          دخول
        </button>

        <p className="text-center mt-4 text-sm">
          ليس لديك حساب؟{" "}
          <Link to="/auth/register" className="text-blue-700 font-bold">
            سجل الآن
          </Link>
        </p>
      </form>
    </div>
  );
}
