import React from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";

export default function SetTeacherRole() {

  const makeTeacher = async () => {
    try {
      const auth = getAuth();
      const functions = getFunctions();

      const user = auth.currentUser;

      if (!user) {
        alert("❌ No logged user");
        return;
      }

      /* CALL CLOUD FUNCTION */
      const setUserRole = httpsCallable(functions, "setUserRole");

      const result = await setUserRole({
        uid: user.uid,
        role: "teacher",
      });

      console.log("✅ FUNCTION RESULT:", result.data);

      /* FORCE TOKEN REFRESH */
      await user.getIdToken(true);

      alert("✅ Role changed to TEACHER\nLogout ثم Login");

    } catch (error) {
      console.error("ROLE ERROR:", error);
      alert("❌ Error — check console");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <h2>🔥 Role Repair Tool</h2>

      <button
        onClick={makeTeacher}
        style={{
          padding: "14px 26px",
          fontSize: 18,
          background: "gold",
          color: "#000",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Make Me Teacher (One Time)
      </button>
    </div>
  );
}