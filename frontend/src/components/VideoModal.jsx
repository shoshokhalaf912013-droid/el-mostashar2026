import React from "react";

export default function VideoModal({ isOpen, onClose, videoUrl, videoType }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-[#111] p-4 rounded-lg w-[90%] max-w-3xl">
        <button
          onClick={onClose}
          className="text-white bg-red-600 px-4 py-1 rounded mb-3"
        >
          ✖ إغلاق
        </button>

        {videoType === "youtube" ? (
          <iframe
            className="w-full h-[400px]"
            src={videoUrl.replace("watch?v=", "embed/")}
            title="video"
            allowFullScreen
          ></iframe>
        ) : (
          <video controls className="w-full h-[400px] rounded">
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
}
