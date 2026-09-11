import { useParams } from "react-router-dom";
import TeacherLiveRoom from "./TeacherLiveRoom";

export default function TeacherLiveRoomWrapper() {
  const { lessonId } = useParams();

  return <TeacherLiveRoom classId={lessonId} />;
}