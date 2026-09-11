import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "رجوع" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="
        inline-flex
        items-center
        gap-2
        mb-6
        px-4
        py-2
        rounded-lg
        border border-yellow-600/50
        text-yellow-300
        bg-zinc-900
        hover:bg-zinc-800
        hover:border-yellow-400
        transition
      "
    >
      ← {label}
    </button>
  );
}
