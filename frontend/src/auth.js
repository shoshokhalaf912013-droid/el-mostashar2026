import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export function useAuth() {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return user;
}
