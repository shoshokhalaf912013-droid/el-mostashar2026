import React from "react";

const videos = [
  { id: 1, title: "ارفعى راسك يا بلدى", src: "https://www.youtube.com/embed/8Z6b_PTyybc" },
  { id: 2, title: "الحملة الفرنسية على مصر", src: "https://www.youtube.com/embed/VyaohdlYb4g" },
  { id: 3, title: "شرح الجغرافيا السياسية", src: "https://www.youtube.com/embed/4tH6k5gYhGg" },
];

export default function Videos() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-[var(--gold)]">الفيديوهات التعليمية</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => (
          <div key={v.id} className="card">
            <div className="aspect-video">
              <iframe title={v.title} src={v.src} frameBorder="0" allowFullScreen className="w-full h-full rounded" />
            </div>
            <div className="p-3 text-[var(--gold)] font-semibold">{v.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
