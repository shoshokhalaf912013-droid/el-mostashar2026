export default function ClickableGrid({
  items = [],
  onClick,
  emptyText = "لا يوجد محتوى",
}) {
  if (!items.length) {
    return (
      <div className="text-center text-red-400 py-20">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onClick(item)}
          className="
            p-6 rounded-xl
            border border-yellow-500/40
            text-yellow-400
            transition-all
            hover:bg-yellow-400
            hover:text-black
            hover:scale-[1.02]
          "
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}
