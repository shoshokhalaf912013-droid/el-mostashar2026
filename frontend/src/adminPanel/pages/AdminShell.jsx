import { useState } from "react";
import "./AdminShell.css";

export default function AdminShell() {
  const [stage, setStage] = useState(null);

  return (
    <div className="admin-shell">
      {/* Top Bar */}
      <header className="admin-header">
        <h1>لوحة التحكم</h1>
      </header>

      {/* Main Content */}
      <div className="admin-body">
        {/* Stages */}
        <div className="admin-column">
          <h3>المراحل</h3>

          <button onClick={() => setStage("primary")}>ابتدائي</button>
          <button onClick={() => setStage("prep")}>إعدادي</button>
          <button onClick={() => setStage("secondary")}>ثانوي</button>
        </div>

        {/* Placeholder */}
        <div className="admin-column">
          <h3>التحديد</h3>
          {stage ? <p>اخترت: {stage}</p> : <p>اختر مرحلة</p>}
        </div>
      </div>
    </div>
  );
}
