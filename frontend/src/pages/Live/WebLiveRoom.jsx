import { useEffect, useRef, useState } from "react";
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function WebLiveRoom({ lessonId }) {

  const { role, currentUser } = useAuth();
  const localVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef(null);

  const [isStarted, setIsStarted] = useState(false);

  const isTeacher = role === "teacher" || role === "admin" || role === "super-admin";

  const roomRef = doc(db, "liveRooms", lessonId);

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

  }, []);

  const startStream = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideo.current.srcObject = stream;

    stream.getTracks().forEach(track => {
      pc.current.addTrack(track, stream);
    });

    setIsStarted(true);
  };

  const createRoom = async () => {

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    await setDoc(roomRef, {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      }
    });

    onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();
      if (!pc.current.currentRemoteDescription && data?.answer) {
        const answer = new RTCSessionDescription(data.answer);
        await pc.current.setRemoteDescription(answer);
      }
    });

    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        await updateDoc(roomRef, {
          candidate: event.candidate.toJSON()
        });
      }
    };
  };

  const joinRoom = async () => {

    const roomSnapshot = await getDoc(roomRef);
    const roomData = roomSnapshot.data();

    await pc.current.setRemoteDescription(
      new RTCSessionDescription(roomData.offer)
    );

    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);

    await updateDoc(roomRef, {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      }
    });

    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        await updateDoc(roomRef, {
          candidate: event.candidate.toJSON()
        });
      }
    };
  };

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>

      <h2>WebRTC Live Room</h2>

      <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
        <video ref={localVideo} autoPlay playsInline muted width="300" />
        <video ref={remoteVideo} autoPlay playsInline width="300" />
      </div>

      {!isStarted && (
        <button onClick={startStream}>تشغيل الكاميرا</button>
      )}

      {isTeacher && isStarted && (
        <button onClick={createRoom}>بدء البث</button>
      )}

      {!isTeacher && isStarted && (
        <button onClick={joinRoom}>دخول البث</button>
      )}

    </div>
  );
}