// SelectTrack.tsx
import { useNavigate } from "react-router-dom";
import { useSecondary } from "../SecondaryContext";

export default function SelectTrack() {
  const { system, gradeId, setTrack } = useSecondary();
  const navigate = useNavigate();

  if (!system || !gradeId) {
    return <div>اختر النظام والصف أولًا</div>;
  }

  const choose = (track: string) => {
    setTrack(track);
    navigate(`/student/secondary/subjects/${gradeId}/${track}`);
  };

  return (
    <>
      <button onClick={() => choose("science")}>علمي علوم</button>
      <button onClick={() => choose("math")}>علمي رياضة</button>
      <button onClick={() => choose("arts")}>أدبي</button>
    </>
  );
}
