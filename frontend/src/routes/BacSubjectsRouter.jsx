import { useParams, Navigate } from "react-router-dom";

import BacSubjectsView from "../pages/Student/Bac/BacSubjectsView";
import BacAdvancedSubjectsView from "../pages/Student/Bac/BacAdvancedSubjectsView";

/**
 * Router ذكي لمسارات البكالوريا:
 * - bac1  ➜ مواد الصف الأول
 * - bac2 / bac3 ➜ المواد المتقدمة
 */
export default function BacSubjectsRouter() {
  const { gradeId } = useParams();

  if (!gradeId) {
    return <Navigate to="/student/bac/grades" replace />;
  }

  if (gradeId === "bac1") {
    return <BacSubjectsView />;
  }

  if (gradeId === "bac2" || gradeId === "bac3") {
    return <BacAdvancedSubjectsView />;
  }

  return <Navigate to="/student/bac/grades" replace />;
}
