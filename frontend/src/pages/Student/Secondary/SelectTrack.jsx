import { useNavigate } from "react-router-dom";
import { useSecondary } from "../../../contexts/SecondaryContext";

export default function SelectTrack() {
  const navigate = useNavigate();
  const { setTrackId } = useSecondary();

  const select = (track) => {
    setTrackId(track);
    navigate("/student/secondary/grades/sec3");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-2xl text-yellow-400 text-center mb-12">
        اختر المسار الدراسي
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <button
          onClick={() => select("scienceMath")}
          className="p-8 rounded-2xl bg-zinc-900 border border-yellow-500/40 hover:scale-105 transition"
        >
          <h2 className="text-xl text-yellow-300 mb-2">علمي رياضة</h2>
          <p className="text-sm text-gray-400">رياضيات بحتة وتطبيقية</p>
        </button>

        <button
          onClick={() => select("scienceScience")}
          className="p-8 rounded-2xl bg-zinc-900 border border-yellow-500/40 hover:scale-105 transition"
        >
          <h2 className="text-xl text-yellow-300 mb-2">علمي علوم</h2>
          <p className="text-sm text-gray-400">أحياء – كيمياء – فيزياء</p>
        </button>

        <button
          onClick={() => select("literary")}
          className="p-8 rounded-2xl bg-zinc-900 border border-yellow-500/40 hover:scale-105 transition"
        >
          <h2 className="text-xl text-yellow-300 mb-2">أدبي</h2>
          <p className="text-sm text-gray-400">تاريخ – جغرافيا – فلسفة</p>
        </button>
      </div>
    </div>
  );
}
