export default function GoldenParticles() {

  const stars = Array.from({ length: 40 });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((_, i) => (
        <span
          key={i}
          className="absolute text-yellow-300 animate-pulse"
          style={{
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            fontSize: Math.random() * 8 + 6 + "px",
            animationDuration: Math.random() * 3 + 2 + "s",
          }}
        >
          ✨
        </span>
      ))}
    </div>
  );
}