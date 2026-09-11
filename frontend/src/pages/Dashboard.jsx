import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          navigate("/login", { replace: true });
          return;
        }

        const data = snap.data();

        // ============================
        // ✅ التوجيه النهائي الصحيح
        // ============================

        if (data.role === "superadmin" || data.role === "superAdmin") {
          navigate("/super", { replace: true });
          return;
        }

        if (data.role === "admin") {
          navigate("/admin/users", { replace: true });
          return;
        }

        if (data.role === "student") {
          // 🔥 بوابة الطالب الصحيحة
          navigate("/student", { replace: true });
          return;
        }

        navigate("/login", { replace: true });
      } catch (e) {
        console.error(e);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
        جاري التحميل...
      </div>
    );
  }

  return null;
};

export default Dashboard;