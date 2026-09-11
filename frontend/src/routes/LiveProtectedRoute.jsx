import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { Navigate, useLocation } from "react-router-dom";

export default function LiveProtectedRoute({ children }) {

  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {

    const check = async () => {

      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists() && snap.data().acceptedLivePolicy) {
        setAllowed(true);
      }

      setLoading(false);
    };

    check();

  }, [user]);

  if (loading) return null;

  if (!allowed) {
    return (
      <Navigate
        to="/live-consent"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}