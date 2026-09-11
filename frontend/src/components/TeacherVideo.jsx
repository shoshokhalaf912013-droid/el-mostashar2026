import { useEffect, useRef } from "react";

export default function TeacherVideo({ room }) {

  const videoRef = useRef();

  useEffect(() => {

    room.on("trackSubscribed", (track) => {

      if (track.kind === "video") {
        track.attach(videoRef.current);
      }

    });

  }, [room]);

  return <video ref={videoRef} autoPlay playsInline />;
}