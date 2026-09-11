import RespiratoryScene from "./scenes/RespiratoryScene";

export default function BiologyLab({ close }) {
  return (
    <div className="biologyLabLayer">
      <button
        onClick={close}
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          zIndex: 10
        }}
      >
        ✕
      </button>

      {/* 👇 هنا بنحط المشهد مباشرة */}
      <RespiratoryScene />
    </div>
  );
}