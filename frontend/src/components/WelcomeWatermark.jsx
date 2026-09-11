import React from "react";

export default function WelcomeWatermark({ name }) {
  if (!name) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "32px",
        fontWeight: "bold",
        color: "#FFD700", // ذهبي واضح
        opacity: 0.25, // علامة مائية
        pointerEvents: "none",
        zIndex: 5,
        textAlign: "center",
        width: "100%",
      }}
    >
      أهلاً بك يا {name}
    </div>
  );
}
