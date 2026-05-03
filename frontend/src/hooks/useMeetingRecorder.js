import { useRef, useState, useEffect } from "react";

export const useMeetingRecorder = () => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const destinationRef = useRef(null);
  const connectedSourcesRef = useRef(new Map());

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  // Call this once when meeting starts with local stream
  const startRecording = async (localStream) => {
    try {
      // Create audio context and destination (mixer)
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      audioContextRef.current = audioContext;
      destinationRef.current = destination;

      // Connect local stream to mixer
      if (localStream) {
        const localSource = audioContext.createMediaStreamSource(localStream);
        localSource.connect(destination);
        connectedSourcesRef.current.set("local", localSource);
      }

      // Start recording from the mixed destination
      const mediaRecorder = new MediaRecorder(destination.stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      console.log("Recording started — mixing all streams");
    } catch (err) {
      console.error("Recording start error:", err);
    }
  };

  // Call this whenever a new remote participant joins
  const addRemoteStream = (socketId, remoteStream) => {
    if (!audioContextRef.current || !destinationRef.current) return;
    if (connectedSourcesRef.current.has(socketId)) return; // already connected

    try {
      const source = audioContextRef.current.createMediaStreamSource(remoteStream);
      source.connect(destinationRef.current);
      connectedSourcesRef.current.set(socketId, source);
      console.log(`Added stream for participant: ${socketId}`);
    } catch (err) {
      console.error("Error adding remote stream:", err);
    }
  };

  // Call this when a participant leaves
  const removeRemoteStream = (socketId) => {
    const source = connectedSourcesRef.current.get(socketId);
    if (source) {
      source.disconnect();
      connectedSourcesRef.current.delete(socketId);
      console.log(`Removed stream for participant: ${socketId}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      connectedSourcesRef.current.forEach((source) => source.disconnect());
      connectedSourcesRef.current.clear();
      audioContextRef.current?.close();
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    addRemoteStream,
    removeRemoteStream,
    isRecording,
    audioBlob,
  };
};