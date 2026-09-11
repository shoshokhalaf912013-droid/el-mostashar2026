import {
  useTracks,
  TrackReferenceOrPlaceholder
} from "@livekit/components-react";

import StudentTile from "./StudentTile";

export default function ParticipantsGrid() {

  const tracks = useTracks([
    { source: "camera", withPlaceholder: true }
  ]);

  return (
    <div className="grid grid-cols-5 gap-3 p-3">

      {tracks.map((track) => (
        <StudentTile
          key={track.participant.identity}
          trackRef={track}
        />
      ))}

    </div>
  );
}