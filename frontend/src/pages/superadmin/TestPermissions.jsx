import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";



export default function TestPermissions() {
  const [log, setLog] = useState([]);

  function push(msg) {
    console.log(msg);
    setLog((prev) => [...prev, msg]);
  }

  useEffect(() => {
    const auth = getAuth();

    // 1️⃣ هل المستخدم مسجّل؟
    if (!auth.currentUser) {
      push("❌ لا يوجد مستخدم مسجّل دخول");
      return;
    }

    push("✅ المستخدم مسجّل دخول");
    push(`UID: ${auth.currentUser.uid}`);

    // 2️⃣ قراءة الـ Claims
    auth.currentUser.getIdTokenResult(true).then((res) => {
      push("🔐 TOKEN CLAIMS:");
      push(JSON.stringify(res.claims, null, 2));
    });

  }, []);

  // 3️⃣ محاولة كتابة حقيقية
  async function testWrite() {
    try {
      await addDoc(collection(db, "testPermissions"), {
        test: true,
        createdAt: serverTimestamp(),
      });

      push("✅ تمت الكتابة بنجاح (الصلاحيات سليمة)");
    } catch (err) {
      push("❌ فشلت الكتابة");
      push(err.message);
      console.error(err);
    }
  }

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h2>🧪 Firestore Permission Test</h2>

      <button
        onClick={testWrite}
        style={{
          padding: "10px 20px",
          margin: "10px 0",
          background: "gold",
          color: "#000",
          fontWeight: "bold",
          borderRadius: "8px",
        }}
      >
        اختبار الكتابة في Firestore
      </button>

      <pre
        style={{
          background: "#111",
          padding: 15,
          borderRadius: 10,
          maxHeight: 300,
          overflow: "auto",
        }}
      >
        {log.join("\n")}
      </pre>
    </div>
  );
}
