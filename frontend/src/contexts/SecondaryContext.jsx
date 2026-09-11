// SecondaryContext.jsx
import { createContext, useContext, useState } from "react";

const SecondaryContext = createContext(null);

export function SecondaryProvider({ children }) {
  const [systemId, setSystemId] = useState("general");
  const [trackId, setTrackId] = useState(null);
  const [gradeId, setGradeId] = useState(null); // ✅ كان ناقص

  return (
    <SecondaryContext.Provider
      value={{
        systemId,
        setSystemId,
        trackId,
        setTrackId,
        gradeId,
        setGradeId,
      }}
    >
      {children}
    </SecondaryContext.Provider>
  );
}

export function useSecondary() {
  const context = useContext(SecondaryContext);
  if (!context) {
    throw new Error("useSecondary must be used inside SecondaryProvider");
  }
  return context;
}
