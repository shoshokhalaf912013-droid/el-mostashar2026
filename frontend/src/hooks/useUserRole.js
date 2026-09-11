import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function useUserRole() {

  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {

    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        setRole("student");
        setLoadingRole(false);
        return;
      }

      try {

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          // دعم النظام القديم والجديد
          if (data.isSuperAdmin === true) {
            setRole("super-admin");
          } else {
            setRole(data.role || "student");
          }

        } else {
          setRole("student");
        }

      } catch (err) {
        console.error("Role load error:", err);
        setRole("student");
      }

      setLoadingRole(false);
    });

    return () => unsub();

  }, []);

  return { role, loadingRole };
}
