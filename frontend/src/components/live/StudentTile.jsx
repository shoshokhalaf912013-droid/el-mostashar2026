import {
  VideoTrack,
  useParticipant
} from "@livekit/components-react";

export default function StudentTile({ trackRef }) {

  const { participant } = useParticipant(trackRef.participant);

  const isCameraOn =
    trackRef.publication &&
    trackRef.publication.isSubscribed;

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden h-40 flex items-center justify-center"
    >

      {isCameraOn ? (
        <VideoTrack trackRef={trackRef} />
      ) : (
        <div className="text-white text-lg">
          {participant.identity}
        </div>
      )}

    </div>
  );
}