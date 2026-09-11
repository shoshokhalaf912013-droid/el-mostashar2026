import { useNavigate } from "react-router-dom";

export default function SuperAdminNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <div className="text-7xl">👑</div>

      <h1 className="text-3xl font-bold text-yellow-400">
        صفحة غير موجودة
      </h1>

      <p className="opacity-70 max-w-md">
        المسار الذي تحاول الوصول إليه غير متاح داخل لوحة السوبر أدمن.
      </p>

      <button
        onClick={() => navigate("/super-admin")}
        className="px-6 py-3 rounded-xl border border-yellow-400 text-yellow-400
                   hover:bg-yellow-400 hover:text-black transition"
      >
        العودة إلى لوحة التحكم
      </button>
    </div>
  );
}
