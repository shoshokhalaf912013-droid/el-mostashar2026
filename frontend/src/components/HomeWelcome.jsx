import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function HomeWelcome() {
  const [name, setName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.fullName || data.name || "");
        }
      } catch (e) {
        console.error(e);
      }
    });

    return () => unsub();
  }, []);

  if (!name) return null;

  return (
    <h2
      style={{
        marginTop: "20px",
        fontSize: "28px",
        color: "#FFD700",
        textAlign: "center",
        fontWeight: "bold",
      }}
    >
      أهلاً بك يا {name} 👋
    </h2>
  );
}
