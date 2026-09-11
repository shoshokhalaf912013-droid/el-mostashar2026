import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "./LiveConsentGate.css";

export default function LiveConsentPage() {

  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/";

  const handleAccept = async () => {

    await updateDoc(doc(db, "users", user.uid), {
      acceptedLivePolicy: true,
      acceptedLiveAt: serverTimestamp()
    });

    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="live-consent-container">
      <div className="live-consent-card">
        <h2>🔴 تنبيه مهم</h2>
        <p>
          هذا البث مباشر وسيتم تسجيله بالكامل لأغراض تعليمية.
        </p>

        <button
          className="live-consent-button"
          onClick={handleAccept}
        >
          ✔ أوافق على دخول بث مسجل بالكامل
        </button>
      </div>
    </div>
  );
}