import { useNavigate } from "react-router-dom";

export default function DangerCard({ title, to }) {
  const navigate = useNavigate();

  return (
    <div className="control-card danger" onClick={() => navigate(to)}>
      <span>{title}</span>
    </div>
  );
}
