// src/features/liveClass/components/StudentsPanel.jsx

export default function StudentsPanel({ students }) {

  /* ================= SORT =================
     الرافعين اليد يظهرون أولاً
  =========================================*/
  const sortedStudents = [...students].sort((a, b) => {
    if (a.state === "hand" && b.state !== "hand") return -1;
    if (a.state !== "hand" && b.state === "hand") return 1;
    return 0;
  });

  return (
    <div style={{ marginTop: 20 }}>
      <h3>👨‍🎓 الطلاب داخل الحصة</h3>

      {sortedStudents.length === 0 && (
        <p>لا يوجد طلاب حالياً...</p>
      )}

      {sortedStudents.map((student) => (
        <div
          key={student.id}
          style={{
            padding: 14,
            marginBottom: 10,
            borderRadius: 12,
            border: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              student.state === "hand"
                ? "#fff7e6"
                : "#fafafa",
          }}
        >
          {/* اسم الطالب */}
          <strong>{student.id}</strong>

          {/* الحالة */}
          <span style={{ fontSize: 20 }}>
            {student.state === "hand"
              ? "✋"
              : "👀"}
          </span>
        </div>
      ))}
    </div>
  );
}