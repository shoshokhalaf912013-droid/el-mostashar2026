import { useState } from "react";
import "./AdminControlDashboard.css";

export default function AdminControlDashboard() {
  const [secondaryType, setSecondaryType] = useState("general");

  return (
    <div className="control-dashboard">
      {/* ابتدائي */}
      <div className="control-column">
        <h2>المرحلة الابتدائية</h2>
        <button className="gold-btn">إدارة المواد</button>
        <button className="gold-btn">إدارة الوحدات</button>
        <button className="gold-btn">إدارة الدروس</button>
      </div>

      {/* إعدادي */}
      <div className="control-column">
        <h2>المرحلة الإعدادية</h2>
        <button className="gold-btn">إدارة المواد</button>
        <button className="gold-btn">إدارة الوحدات</button>
        <button className="gold-btn">إدارة الدروس</button>
      </div>

      {/* ثانوي */}
      <div className="control-column">
        <h2>المرحلة الثانوية</h2>

        <div className="secondary-switch">
          <button
            className={
              secondaryType === "general"
                ? "switch-btn active"
                : "switch-btn"
            }
            onClick={() => setSecondaryType("general")}
          >
            ثانوي عام
          </button>

          <button
            className={
              secondaryType === "bac"
                ? "switch-btn active"
                : "switch-btn"
            }
            onClick={() => setSecondaryType("bac")}
          >
            بكالوريا
          </button>
        </div>

        <button className="gold-btn">إدارة المواد</button>
        <button className="gold-btn">إدارة الوحدات</button>
        <button className="gold-btn">إدارة الدروس</button>
      </div>
    </div>
  );
}
