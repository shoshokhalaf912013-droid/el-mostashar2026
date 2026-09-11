import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SecondaryGradesView() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("secondarySystem") !== "general") {
      navigate("/student/secondary", { replace: true });
    }
  }, [navigate]);

  const grades = [
    { id: "sec1", title: "الصف الأول الثانوي" },
    { id: "sec2", title: "الصف الثاني الثانوي" },
    { id: "sec3", title: "الصف الثالث الثانوي" },
  ];

  const handleClick = (gradeId) => {
    localStorage.setItem("secondaryGrade", gradeId);

    if (gradeId === "sec1") {
      navigate(`/student/secondary/subjects/${gradeId}`);
    } else {
      navigate(`/student/secondary/advanced-subjects/${gradeId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-2xl text-yellow-400 text-center mb-10">
        اختر الصف
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <div
            key={grade.id}
            onClick={() => handleClick(grade.id)}
            className="
              cursor-pointer
              rounded-2xl
              border border-yellow-500/40
              bg-gradient-to-b from-zinc-900 to-black
              p-8 text-center
              shadow-[0_0_25px_rgba(212,175,55,0.15)]
              hover:shadow-[0_0_40px_rgba(212,175,55,0.35)]
              hover:scale-105
              transition
            "
          >
            <p className="text-lg text-yellow-300 font-semibold">
              {grade.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
