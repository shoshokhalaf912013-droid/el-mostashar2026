import "./GoldActionButton.css";

export default function GoldActionButton({
  children,
  onClick,
  icon = "➕",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`gold-action-btn ${className}`}
    >
      <span className="gold-action-icon">{icon}</span>
      {children}
    </button>
  );
}
