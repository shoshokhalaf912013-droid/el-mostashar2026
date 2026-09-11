import { Outlet, useNavigate } from "react-router-dom";
import "./StudentLayout.css";

export default function StudentLayout() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="student-root">
      {/* HEADER */}
      <header className="student-header">
        <button onClick={handleBack} className="gold-back-btn">
          ← رجوع
        </button>
      </header>

      {/* PAGE CONTAINER */}
      <main className="student-container">
        <Outlet />
      </main>
    </div>
  );
}
