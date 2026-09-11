import React from "react";
import { Outlet } from "react-router-dom";

export default function LiveLayout() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#0b1320",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Outlet />
    </div>
  );
}