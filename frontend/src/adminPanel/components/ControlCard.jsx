import { useNavigate } from "react-router-dom";

export default function ControlCard({ title, to }) {
  const navigate = useNavigate();

  return (
    <div className="control-card" onClick={() => navigate(to)}>
      <span>{title}</span>
    </div>
  );
}
