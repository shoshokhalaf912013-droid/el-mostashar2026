export default function Video({ src }) {
  if (!src) return null;

  return (
    <div
      className="video-wrapper"
      style={{
        width: "100%",
        maxWidth: "100%",
        aspectRatio: "16 / 9",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <iframe
        src={src}
        title="Lesson Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}
