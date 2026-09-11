import { useNavigate } from "react-router-dom";

export default function SelectStage() {
  const navigate = useNavigate();

  const selectGeneral = () => {
    localStorage.setItem("secondarySystem", "general");
    localStorage.removeItem("secondaryGrade");
    localStorage.removeItem("secondaryTrack");

    navigate("/student/secondary/grades");
  };

  const selectBac = () => {
    localStorage.setItem("secondarySystem", "bac");
    localStorage.removeItem("secondaryGrade");
    localStorage.removeItem("secondaryTrack");

    navigate("/student/bac/grades");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold text-yellow-400 text-center mb-10">
        اختر نظام الدراسة
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* الثانوية العامة */}
        <div
          onClick={selectGeneral}
          className="cursor-pointer rounded-xl border border-yellow-500/40 bg-zinc-900 p-10 text-center hover:scale-105 transition"
        >
          <h2 className="text-2xl text-yellow-400 font-bold">
            الثانوية العامة
          </h2>
        </div>

        {/* البكالوريا */}
        <div
          onClick={selectBac}
          className="cursor-pointer rounded-xl border border-yellow-500/40 bg-zinc-900 p-10 text-center hover:scale-105 transition"
        >
          <h2 className="text-2xl text-yellow-400 font-bold">
            البكالوريا المصرية
          </h2>
        </div>

      </div>

    </div>
  );
}