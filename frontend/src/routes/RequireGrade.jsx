import { Navigate, useParams, useLocation } from "react-router-dom";

/*
==================================================
SMART GRADE GUARD
لا يخرج الطالب إلا إذا لا يوجد grade فعلاً
==================================================
*/

export default function RequireGrade({ children }) {

  const params = useParams();
  const location = useLocation();

  /* ===== grade من الرابط ===== */
  const gradeFromUrl = params.gradeId;

  /* ===== grade محفوظ ===== */
  const savedGrade = localStorage.getItem("studentGradeId");

  /* ===== لا يوجد نهائياً ===== */
  if (!gradeFromUrl && !savedGrade) {
    return (
      <Navigate
        to="/student/select-stage"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
