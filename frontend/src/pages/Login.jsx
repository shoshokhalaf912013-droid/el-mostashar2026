import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOGIN ================= */

  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ يمنع إعادة تحميل الصفحة

    if (loading) return; // ✅ يمنع الضغط مرتين

    setError("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      console.log("✅ LOGIN SUCCESS:", cred.user.uid);

      // ⭐ ننتظر لحظة صغيرة حتى يلتقط App.jsx حالة المستخدم
      setTimeout(() => {
        navigate("/");
      }, 400);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("❌ البريد أو كلمة المرور غير صحيحة");
    }

    setLoading(false);
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
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "جاري الدخول..." : "دخول"}
        </button>

        {error && <p className="error">{error}</p>}

      </form>
    </div>
  );
}
