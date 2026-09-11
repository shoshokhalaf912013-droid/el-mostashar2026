import TeacherLiveRoom from "../../features/liveClass/TeacherLiveRoom";

export default function LiveDashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>📡 إدارة الحصة المباشرة</h2>

      <TeacherLiveRoom />
    </div>
  );
}