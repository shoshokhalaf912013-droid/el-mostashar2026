import React from "react";

export default function Gallery() {
  const images = [
    "/assets/gallery/img1.jpg",
    "/assets/gallery/img2.jpg",
    "/assets/gallery/img3.jpg",
    "/assets/gallery/img4.jpg",
    "/assets/gallery/img5.jpg",
    "/assets/gallery/img6.jpg",
  ];

  return (
    <div className="page-container">
      <h1 className="text-center text-3xl font-bold text-[var(--gold)] mb-8">
        معرض الصور
      </h1>

      <div className="items-grid">
        {images.map((src, index) => (
          <div key={index} className="super-card">
            <img src={src} alt={`image-${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
