import { useState } from "react";
import AdminControlDashboard from "./AdminControlDashboard";
import AdminSubjectBuilder from "../components/subjectBuilder/AdminSubjectBuilder";

export default function AdminContentController() {
  const [view, setView] = useState("dashboard");

  const [context, setContext] = useState({
    gradeId: null,
    subjectId: null,
    trackId: null,
  });

  /* فتح إدارة الوحدات */
  const openUnits = ({ gradeId, subjectId, trackId }) => {
    setContext({ gradeId, subjectId, trackId });
    setView("units");
  };

  /* رجوع */
  const goBack = () => {
    setView("dashboard");
    setContext({
      gradeId: null,
      subjectId: null,
      trackId: null,
    });
  };

  if (view === "units") {
    return (
      <>
        <button
          onClick={goBack}
          style={{
            margin: "20px",
            background: "#111",
            color: "#d4af37",
            border: "1px solid #d4af37",
            padding: "8px 16px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          ← رجوع للوحة التحكم
        </button>

        <AdminSubjectBuilder
          gradeId={context.gradeId}
          subjectId={context.subjectId}
          trackId={context.trackId}
        />
      </>
    );
  }

  return <AdminControlDashboard onOpenUnits={openUnits} />;
}
