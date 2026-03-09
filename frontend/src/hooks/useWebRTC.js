import { useCallback, useEffect, useRef, useState } from "react";

//Ice confir: google STUN server
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function useWebRTC(
  socket,
  roomCode,
  username,
  userId,
  participantId,
) {
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const screenStreamRef = useRef(null);
  const stopScreenShareRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [roomUserCount, setRoomUserCount] = useState(1);

  //get camera and mic
  useEffect(() => {
    if (!socket) {
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        setLocalStream(stream);
        //pass participantId from REST join into socket
        socket.emit("join-room", { roomCode, username, userId, participantId });
      })
      .catch((error) => {
        console.error("Media error:", error);
        socket.emit("join-room", { roomCode, username, userId, participantId });
      });

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, [socket]);

  //RTC-peer connection
  const createPeer = useCallback(
    (targetSocketId, initiator) => {
      if (peersRef.current[targetSocketId]) {
        return peersRef.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(ICE_CONFIG);

      //attach pending candidates buffer to each PC
      pc._pendingCandidates = [];

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((t) => pc.addTrack(t, localStreamRef.current));
      }

      //find network path and forward it to other peers
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            candidate: e.candidate,
            toSocketId: targetSocketId,
          });
        }
      };

      pc.ontrack = (e) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: { ...prev[targetSocketId], stream: e.streams[0] },
        }));
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          delete peersRef.current[targetSocketId];
          setRemoteStreams((prev) => {
            const n = { ...prev };
            delete n[targetSocketId];
            return n;
          });
        }
      };

      if (initiator) {
        pc.createOffer()
          .then((o) => pc.setLocalDescription(o))
          .then(() =>
            socket.emit("offer", {
              offer: pc.localDescription,
              toSocketId: targetSocketId,
            }),
          );
      }

      peersRef.current[targetSocketId] = pc;
      return pc;
    },
    [socket],
  );

  //Socket event listeners
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("existing-peers", (peers) => {
      peers.forEach(({ socketId, username: n }) => {
        setRemoteStreams((prev) => ({ ...prev, [socketId]: { username: n } }));
        createPeer(socketId, true);
      });
    });

    socket.on("peer-joined", ({ socketId, username: n }) => {
      setRemoteStreams((prev) => ({ ...prev, [socketId]: { username: n } }));
      createPeer(socketId, false);
    });

    socket.on("offer", async ({ offer, fromSocketId }) => {
      const pc = createPeer(fromSocketId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      if (pc._pendingCandidates?.length) {
        for (const c of pc._pendingCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (error) {
            console.error("offer error", error);
          }
        }
        pc._pendingCandidates = [];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", {
        answer: pc.localDescription,
        toSocketId: fromSocketId,
      });
    });

    socket.on("answer", async ({ answer, fromSocketId }) => {
      const pc = peersRef.current[fromSocketId];
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      if (pc._pendingCandidates?.length) {
        for (const c of pc._pendingCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch {
            console.error("answer error", error);
          }
        }
        pc._pendingCandidates = [];
      }
    });

    socket.on("ice-candidate", async ({ candidate, fromSocketId }) => {
      const pc = peersRef.current[fromSocketId];
      if (!pc) return;

      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Buffer it — will be flushed when remote description is set
          pc._pendingCandidates = pc._pendingCandidates || [];
          pc._pendingCandidates.push(candidate);
        }
      } catch (error) {
        console.error("ICE error:", error);
      }
    });

    socket.on("peer-left", ({ socketId }) => {
      peersRef.current[socketId]?.close();
      delete peersRef.current[socketId];
      setRemoteStreams((prev) => {
        const n = { ...prev };
        delete n[socketId];
        return n;
      });
    });

    socket.on("peer-media-state", ({ socketId, cameraOn, micOn }) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [socketId]: { ...prev[socketId], cameraOn, micOn },
      }));
    });

    socket.on("room-users", (count) => setRoomUserCount(count));

    return () => {
      [
        "existing-peers",
        "peer-joined",
        "offer",
        "answer",
        "ice-candidate",
        "peer-left",
        "peer-media-state",
        "room-users",
      ].forEach((e) => socket.off(e));
    };
  }, [socket, createPeer]);

  //Controls

  //Toggle camera on/off
  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) {
      return;
    }
    track.enabled = !track.enabled;
    setCameraOn((prev) => {
      socket.emit("media-state", { roomCode, cameraOn: !prev, micOn });
      return !prev;
    });
  };

  //Toggle mic on/off
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      return;
    }
    track.enabled = !track.enabled;
    setMicOn((prev) => {
      socket.emit("media-state", { roomCode, cameraOn, micOn: !prev });
      return !prev;
    });
  };

  //Toggle screen-share on/off
  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    const cam = localStreamRef.current?.getVideoTracks()[0];
    if (cam) {
      Object.values(peersRef.current).forEach((pc) => {
        pc.getSenders()
          .find((s) => s.track?.kind === "video")
          ?.replaceTrack(cam);
      });
    }
    setSharingScreen(false);
    socket.emit("screen-share-off", { roomCode });
  };

  stopScreenShareRef.current = stopScreenShare;

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = stream;
      const screenTrack = stream.getVideoTracks()[0];

      Object.values(peersRef.current).forEach((pc) => {
        pc.getSenders()
          .find((s) => s.track?.kind === "video")
          ?.replaceTrack(screenTrack);
      });

      setSharingScreen(true);
      socket.emit("screen-share-on", { roomCode });
      screenTrack.onended = () => stopScreenShareRef.current();
    } catch (error) {
      console.error("Screen share failed:", error);
    }
  };

  return {
    localStream,
    remoteStreams,
    cameraOn,
    micOn,
    sharingScreen,
    roomUserCount,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
  };
}
