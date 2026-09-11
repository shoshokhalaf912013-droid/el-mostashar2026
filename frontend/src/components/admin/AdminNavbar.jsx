export default function AdminNavbar() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#0b0b0b] border-b border-yellow-700 px-6 py-4 flex justify-between items-center">
      <span
        className="text-yellow-400 font-semibold cursor-pointer"
        onClick={() => navigate("/admin")}
      >
        Super Admin
      </span>

      <button
        onClick={() => navigate("/login")}
        className="text-sm text-red-400 hover:underline"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
