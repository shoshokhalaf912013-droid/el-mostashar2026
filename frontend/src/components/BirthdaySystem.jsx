import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BirthdayModal from "./BirthdayModal";

export default function BirthdaySystem({ user }) {
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 🔥 يعمل فقط في الهوم
    if (location.pathname !== "/") {
      setShow(false);
      return;
    }

    if (!user || !user.birthDate) return;

    const today = new Date();
    const birth = new Date(user.birthDate);

    const isBirthday =
      today.getDate() === birth.getDate() &&
      today.getMonth() === birth.getMonth();

    const todayKey = today.toISOString().split("T")[0];

    const closedToday = localStorage.getItem("birthdayClosed_" + todayKey);
    const closedSession = sessionStorage.getItem("birthdaySessionClosed");

    if (isBirthday && !closedToday && !closedSession) {
      setShow(true);
    }
  }, [user, location]);

  const handleClose = () => {
    const todayKey = new Date().toISOString().split("T")[0];

    localStorage.setItem("birthdayClosed_" + todayKey, "true");
    sessionStorage.setItem("birthdaySessionClosed", "true");

    setShow(false);
  };

  if (!show) return null;

  return (
    <BirthdayModal
      name={user.name || "طالبنا العزيز"}
      onClose={handleClose}
    />
  );
}