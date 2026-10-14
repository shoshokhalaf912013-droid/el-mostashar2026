import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  /* ================= LOGIN ================= */

  const handleLogin = async (e) => {
    e.preventDefault(); // يمنع إعادة تحميل الصفحة

    if (loading) return; // يمنع الضغط مرتين

    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      console.log("✅ LOGIN SUCCESS:", cred.user.uid);

      // ننتظر لحظة صغيرة حتى يلتقط App.jsx حالة المستخدم
      setTimeout(() => {
        navigate("/");
      }, 400);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("❌ البريد أو كلمة المرور غير صحيحة");
    }

    setLoading(false);
  };

  /* ================= PASSWORD RESET ================= */

  const handlePasswordReset = async () => {

    if (resetLoading) return;

    const email = form.email.trim();

    setError("");
    setResetMessage("");

    if (!email) {
      setError("❌ اكتب البريد الإلكتروني أولًا");
      return;
    }

    setResetLoading(true);

    try {

      await sendPasswordResetEmail(auth, email);

      setResetMessage(
        "✔ تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني. راجع البريد الوارد أو مجلد الرسائل غير المرغوب فيها."
      );

    } catch (err) {

      console.error("PASSWORD RESET ERROR:", err);

      /*
       * لا نعرض تفاصيل Firebase للمستخدم.
       * نحافظ على رسالة عامة وآمنة.
       */

      setError(
        "❌ تعذر إرسال رابط استعادة كلمة المرور. تأكد من صحة البريد الإلكتروني وحاول مرة أخرى."
      );

    } finally {

      setResetLoading(false);

    }
  };

  /* ================= UI ================= */

  return (
    <div className="login-page" dir="rtl">

      <form onSubmit={handleLogin} className="login-box">

        <h2>تسجيل الدخول</h2>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "جاري الدخول..." : "دخول"}
        </button>

        {/* ================= FORGOT PASSWORD ================= */}

        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={resetLoading}
          className="forgot-password-button"
        >
          {resetLoading
            ? "جاري إرسال رابط الاستعادة..."
            : "نسيت كلمة المرور؟"}
        </button>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {resetMessage && (
          <p className="success">
            {resetMessage}
          </p>
        )}

      </form>

    </div>
  );
}