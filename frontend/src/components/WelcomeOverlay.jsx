import React, { useEffect, useState } from "react";

export default function WelcomeOverlay({ name }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!name) return;

    const today = new Date().toDateString();
    const lastWelcome = localStorage.getItem("welcome-date");

    // يظهر مرة واحدة يوميًا
    if (lastWelcome !== today) {
      setVisible(true);
      localStorage.setItem("welcome-date", today);

      setTimeout(() => {
        setVisible(false);
      }, 4000);
    }
  }, [name]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#111",
          padding: "40px",
          borderRadius: "20px",
          border: "2px solid gold",
          textAlign: "center",
          color: "gold",
          fontSize: "28px",
          fontWeight: "bold",
          boxShadow: "0 0 40px rgba(255,215,0,0.6)",
        }}
      >
        ✨ أهلاً بك {name} ✨
        <div style={{ color: "white", marginTop: "10px", fontSize: "18px" }}>
          نتمنى لك تجربة تعليمية رائعة 🌟
        </div>
      </div>
    </div>
  );
}
