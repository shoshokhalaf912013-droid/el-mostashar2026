// src/pages/Student/SelectSecondarySystem.jsx
import { useNavigate, useParams } from "react-router-dom";

export default function SelectSecondarySystem() {
  const navigate = useNavigate();
  const { stageId } = useParams();

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-3xl font-bold text-center text-yellow-400 mb-10">
        اختر النظام
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div
          onClick={() =>
            navigate(`/student/select-grade/${stageId}/general`)
          }
          className="
            cursor-pointer
            rounded-xl
            border border-yellow-500/40
            bg-[#111]
            p-10
            text-center
            hover:border-yellow-400
            hover:scale-105
            transition
          "
        >
          <h2 className="text-2xl font-bold text-yellow-300">
            الثانوي العام
          </h2>
        </div>

        <div
          onClick={() =>
            navigate(`/student/select-grade/${stageId}/bac`)
          }
          className="
            cursor-pointer
            rounded-xl
            border border-yellow-500/40
            bg-[#111]
            p-10
            text-center
            hover:border-yellow-400
            hover:scale-105
            transition
          "
        >
          <h2 className="text-2xl font-bold text-yellow-300">
            البكالوريا المصرية
          </h2>
        </div>
      </div>
    </div>
  );
}
