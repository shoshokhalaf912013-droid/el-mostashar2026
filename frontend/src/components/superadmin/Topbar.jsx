export default function Topbar() {
  return (
    <div className="w-full bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
      <h1 className="text-2xl font-semibold">لوحة السوبر أدمن</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-300">Super Admin</span>
        <img
          src="https://ui-avatars.com/api/?name=Super+Admin"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </div>
  );
}
