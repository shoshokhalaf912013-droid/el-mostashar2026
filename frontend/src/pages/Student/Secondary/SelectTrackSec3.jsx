import { useNavigate } from "react-router-dom";

export default function SelectTrackSec3() {
  const navigate = useNavigate();

  const selectTrack = (trackId) => {
    localStorage.setItem("secondaryTrack", trackId);
    navigate("/student/secondary/subjects/sec3");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>اختر الشعبة</h2>

      <div style={styles.buttons}>
        <button
          style={styles.button}
          onClick={() => selectTrack("onlyscience")}
        >
          علمي علوم
        </button>

        <button
          style={styles.button}
          onClick={() => selectTrack("math")}
        >
          علمي رياضة
        </button>

        <button
          style={styles.button}
          onClick={() => selectTrack("literary")}
        >
          أدبي
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    color: "#ffd700",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginBottom: "50px",
    fontSize: "32px",
    fontWeight: "bold",
  },

  buttons: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  button: {
    background: "#111",
    border: "2px solid #ffd700",
    color: "#ffd700",
    padding: "35px 70px",      // ⬅ تكبير حقيقي
    fontSize: "26px",          // ⬅ خط واضح
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "18px",
    minWidth: "260px",         // ⬅ توحيد الحجم
    transition: "all 0.25s ease",
  },
};
