import React, { useEffect } from "react";
import ReactPlayer from "react-player";

export default function ProtectedVideo({ hlsUrl, user }) {
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    return () => document.removeEventListener("contextmenu", prevent);
  }, []);

  return (
    <div className="relative">
      <div className="absolute z-20 pointer-events-none top-3 left-3 text-sm opacity-60 text-white">
        {user?.name || "زائر"} • {user?.email || ""}
      </div>
      <div className="aspect-video bg-black">
        <ReactPlayer url={hlsUrl} controls width="100%" height="100%" />
      </div>
    </div>
  );
}
