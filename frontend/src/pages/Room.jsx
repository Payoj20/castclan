import client from '@/api/axios';
import ChatPanel from '@/components/ChatPanel';
import ControlBar from '@/components/ControlBar';
import PollPanel from '@/components/PollPanel';
import VideoTile from '@/components/VideoTile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import useWebRTC from '@/hooks/useWebRTC';
import { Grid2x2, LayoutTemplate, Users, Pin, UserMinus, PinOff, Hand, BarChart2, X, UserX, PhoneOff, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useMeetingRecorder } from '@/hooks/useMeetingRecorder';
import MeetingSummaryModal from '@/components/MeetingSummary';
import { Sparkles } from "lucide-react";


//Video Grid 
function VideoGrid({ streams, renderTile }) {
    const count = streams.length;

    if (count === 1) return (
        <div className="flex items-center justify-center w-full h-full p-4">
            <div className="w-full h-full max-w-4xl">{renderTile(streams[0])}</div>
        </div>
    );

    if (count === 2) return (
        <div className="flex gap-3 w-full h-full p-3 items-center justify-center">
            {streams.map(s => (
                <div key={s.socketId} className="flex-1 h-full max-h-[75vh]">{renderTile(s)}</div>
            ))}
        </div>
    );

    if (count === 3) return (
        <div className="flex flex-col gap-3 w-full h-full p-3 min-h-0">
            <div className="flex gap-3 flex-1 min-h-0">
                {streams.slice(0, 2).map(s => (
                    <div key={s.socketId} className="flex-1 min-h-0">{renderTile(s)}</div>
                ))}
            </div>
            <div className="flex justify-center flex-1 min-h-0">
                <div className="w-1/2 min-h-0">{renderTile(streams[2])}</div>
            </div>
        </div>
    );

    if (count === 4) return (
        <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full h-full p-3 min-h-0">
            {streams.map(s => <div key={s.socketId} className="min-h-0">{renderTile(s)}</div>)}
        </div>
    );

    if (count === 5) return (
        <div className="flex flex-col gap-3 w-full h-full p-3 min-h-0">
            <div className="flex gap-3 flex-1 min-h-0">
                {streams.slice(0, 3).map(s => (
                    <div key={s.socketId} className="flex-1 min-h-0">{renderTile(s)}</div>
                ))}
            </div>
            <div className="flex gap-3 justify-center flex-1 min-h-0">
                {streams.slice(3, 5).map(s => (
                    <div key={s.socketId} className="w-1/3 min-h-0">{renderTile(s)}</div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-3 grid-rows-2 gap-3 w-full h-full p-3 min-h-0">
            {streams.map(s => <div key={s.socketId} className="min-h-0">{renderTile(s)}</div>)}
        </div>
    );
}

// Pinned View
function SpeakerView({ streams, pinnedSocketId, renderTile, onUnpin }) {
    const pinned = streams.find(s => s.socketId === pinnedSocketId) || streams[0];
    const others = streams.filter(s => s.socketId !== pinned?.socketId);

    return (
        <div className="flex gap-2 w-full h-full p-2 min-h-0">
            <div className="flex-1 h-full min-h-0 relative">
                {pinned && renderTile(pinned)}
                <Button
                    size="sm"
                    onClick={onUnpin}
                    className="absolute top-3 right-3 h-7 px-2.5 gap-1.5 text-xs
        bg-black/50 hover:bg-blue-600 text-white border border-white/10
        hover:border-blue-500 backdrop-blur-sm rounded-lg z-10
        transition-all duration-200 shadow-lg"
                >
                    <PinOff className="w-3 h-3" />
                    Unpin
                </Button>
            </div>
            {others.length > 0 && (
                <div className="flex flex-col gap-2 w-44 overflow-y-auto shrink-0">
                    {others.map(s => (
                        <div key={s.socketId} className="shrink-0 h-28">{renderTile(s, true)}</div>
                    ))}
                </div>
            )}
        </div>
    );
}


// Full-screen errors 
const OverlayScreen = ({ icon: Icon, iconColor = "text-gray-400", title, subtitle, subtitleColor = "text-gray-400" }) => (
    <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-10 text-center max-w-sm shadow-2xl">
            <div className={`flex justify-center mb-5 ${iconColor}`}>
                <Icon className="w-12 h-12" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">{title}</h2>
            <p className={`text-sm ${subtitleColor}`}>{subtitle}</p>
        </div>
    </div>
);

function InCallToast({ toast, onDismiss }) {
    if (!toast) return null;
    const iconMap = {
        hand: <Hand className="w-4 h-4 text-yellow-400 shrink-0" />,
        poll: <BarChart2 className="w-4 h-4 text-blue-400 shrink-0" />,
    };
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2.5 bg-gray-900/95 backdrop-blur-md border border-white/10 text-white px-4 py-2.5 rounded-2xl text-sm shadow-2xl max-w-xs">
                {iconMap[toast.type] || null}
                <span className="text-gray-200 text-sm">{toast.message}</span>
                <button onClick={onDismiss} className="ml-1 text-gray-500 hover:text-white transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}


// Room Page
const Room = () => {
    const { roomCode } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const socketRef = useRef(null);
    const chatOpenRef = useRef(false);

    const [socket, setSocket] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [participantId, setParticipantId] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [joinError, setJoinError] = useState(null);
    const [meetingEnded, setMeetingEnded] = useState(null);
    const [wasKicked, setWasKicked] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState({});
    const [toast, setToast] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [pinnedSocketId, setPinnedSocketId] = useState(null);
    const [pollOpen, setPollOpen] = useState(false);
    const [polls, setPolls] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [elapsed, setElapsed] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const [showSummary, setShowSummary] = useState(false);
    const { startRecording, stopRecording, addRemoteStream, removeRemoteStream, isRecording, audioBlob } = useMeetingRecorder();

    const username = user?.username || "Guest";
    const userId = user?.id || null;

    //Latest chat
    useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

    //Timer
    useEffect(() => {
        const interval = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const toastTimerRef = useRef(null);
    const showToast = (message, type = "default") => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ message, type });
        toastTimerRef.current = setTimeout(() => setToast(null), 3500);
    };
    const dismissToast = () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast(null);
    };

    //Join meeting first with REST and then connect to socket
    useEffect(() => {
        const joinAndConnect = async () => {
            try {
                //REST call create participant
                const { data } = await client.post(`/meeting/join/${roomCode}`, {
                    guestName: !user ? username : undefined
                });
                setParticipantId(data.participantId);
                setIsHost(data.isHost);

                //Socket connection after DB is confirmed
                const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
                    reconnection: true, reconnectionAttempts: 5,
                    reconnectionDelay: 1000, reconnectionDelayMax: 5000,
                });
                socketRef.current = newSocket;
                setSocket(newSocket);

                //New char messages
                newSocket.on("receive-message", (msg) => {
                    setMessages(prev => [...prev, msg]);
                    if (!chatOpenRef.current) { setUnreadMessages(prev => prev + 1); }
                });

                //Host end meeting
                newSocket.on("meeting-ended", ({ reason }) => {
                    setMeetingEnded(reason);
                    setTimeout(() => navigate("/"), 4000);
                });

                //Host kicked other user
                newSocket.on("you-were-kicked", () => {
                    setWasKicked(true);
                    setTimeout(() => navigate("/"), 3000);
                });

                //Raised hand
                newSocket.on("peer-raised-hand", ({ socketId, username: n }) => {
                    setRaisedHands(prev => ({ ...prev, [socketId]: true }));
                    showToast(`${n} raised their hand`, "hand");
                });

                newSocket.on("peer-lowered-hand", ({ socketId }) => {
                    setRaisedHands(prev => { const n = { ...prev }; delete n[socketId]; return n; });
                });

                //Reconnect into the socket room
                newSocket.on("reconnect", () => {
                    newSocket.emit("join-room", { roomCode, username, userId, participantId: data.participantId });
                });

                //Gave up reconnecting
                newSocket.on("reconnect_failed", () => {
                    setJoinError("Connection lost. Please rejoin the meeting.");
                });

                //Create poll
                newSocket.on("poll-created", (poll) => {
                    setPolls(prev => {
                        if (prev.some(p => p.id === poll.id)) { return prev; }
                        return [poll, ...prev];
                    });
                    showToast("New poll available", "poll");
                });

                newSocket.on("poll-vote-received", ({ pollId, optionIndex, username: voter }) => {
                    setPolls(prev => prev.map(p => {
                        if (p.id !== pollId) { return p; }
                        const votes = { ...p.votes };
                        if (!votes[optionIndex]) { votes[optionIndex] = []; }
                        if (!votes[optionIndex].includes(voter)) { votes[optionIndex] = [...votes[optionIndex], voter]; }
                        return { ...p, votes };
                    }));
                });

                newSocket.on("poll-closed", ({ pollId }) => {
                    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, active: false } : p));
                });

                //Q&A
                newSocket.on("question-received", (q) => {
                    setQuestions(prev => [q, ...prev]);
                });

                newSocket.on("question-upvoted", ({ questionId, username: voter }) => {
                    setQuestions(prev => prev.map(q => {
                        if (q.id !== questionId) { return q; }
                        if (q.upvotes.includes(voter)) { return q; }
                        return { ...q, upvotes: [...q.upvotes, voter] };
                    }));
                });

                newSocket.on("question-answered", ({ questionId }) => {
                    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answered: true } : q));
                });

            } catch (error) {
                console.error("que-ans error", error);
                setJoinError(error.response?.data?.message || "Could not join meeting");
            }
        };

        joinAndConnect();
        //Disconnect
        return () => socketRef.current?.disconnect();
    }, []);

    const {
        localStream, remoteStreams,
        cameraOn, micOn, sharingScreen, roomUserCount,
        toggleCamera, toggleMic, startScreenShare, stopScreenShare
    } = useWebRTC(socket, roomCode, username, userId, participantId);

    //Recording start
    useEffect(() => {
        if (localStream && participantId) {
            startRecording(localStream);
        }
    }, [localStream, participantId]);

    useEffect(() => {
        Object.entries(remoteStreams).forEach(([socketId, data]) => {
            if (data.stream) {
                addRemoteStream(socketId, data.stream);
            }
        });
    }, [remoteStreams]);

    //Disconnect
    const handleLeave = async () => {
        if (participantId) {
            try {
                await client.post("/meeting/leave", { participantId });
            } catch {
                console.error("handleLeave error", error);
            }
        }
        socketRef.current?.disconnect();
        navigate("/home");
    };

    const sendMessage = (text) => socket?.emit("send-message", { roomCode, message: text });
    const toggleHand = () => { const next = !handRaised; setHandRaised(next); socket?.emit(next ? "raise-hand" : "lower-hand", { roomCode }); };
    const pinUser = (socketId) => { setPinnedSocketId(socketId); setViewMode("speaker"); };
    const unpin = () => { setPinnedSocketId(null); setViewMode("grid"); };
    const kickParticipant = (targetSocketId) => { if (!isHost) { return; } socket?.emit("kick-user", { roomCode, targetSocketId }); };

    //Error screens
    if (wasKicked) return (
        <OverlayScreen icon={UserX} title="You were removed" subtitle="The host removed you from this meeting. Redirecting..." subtitleColor="text-red-400" />
    );

    if (joinError) return (
        <div className="h-screen bg-gray-950 flex items-center justify-center">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-10 text-center max-w-sm shadow-2xl">
                <div className="flex justify-center mb-5 text-red-400">
                    <TriangleAlert className="w-12 h-12" />
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">Cannot join meeting</h2>
                <p className="text-red-400 text-sm mb-6">{joinError}</p>
                <Button onClick={() => navigate("/home")} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6">
                    Back to Home
                </Button>
            </div>
        </div>
    );

    if (meetingEnded) return (
        <OverlayScreen icon={PhoneOff} title="Meeting Ended" subtitle={meetingEnded} subtitleColor="text-yellow-400" />
    );

    //Streams
    const allStreams = [
        { socketId: "local", stream: localStream, username: `${username} (You)`, isLocal: true, raisedHand: handRaised },
        ...Object.entries(remoteStreams).map(([id, data]) => ({
            socketId: id, stream: data.stream,
            username: data.username || "Participant",
            cameraOn: data.cameraOn, micOn: data.micOn,
            isLocal: false, raisedHand: !!raisedHands[id]
        }))
    ];

    const rightPanelOpen = chatOpen || pollOpen;

    //Video tile
    const renderTile = (s, isSmall = false) => (
        <div className="relative group w-full h-full">
            <VideoTile
                stream={s.stream}
                username={s.username}
                isLocal={s.isLocal}
                cameraOn={s.isLocal ? cameraOn : s.cameraOn !== false}
                micOn={s.isLocal ? micOn : s.micOn !== false}
                raisedHand={s.raisedHand}
                isPinned={pinnedSocketId === s.socketId}
            />
            {/* Pin button */}
            {!isSmall && viewMode === "grid" && (
                <Button
                    size="sm"
                    onClick={() => pinUser(s.socketId)}
                    className="absolute bottom-3 right-2 h-7 px-2.5 gap-1.5 text-xs
                    bg-black/50 hover:bg-blue-600 text-white border border-white/10
                    hover:border-blue-500 backdrop-blur-sm rounded-lg
                    opacity-0 group-hover:opacity-100 transition-all duration-200
                    shadow-lg"
                >
                    <Pin className="w-3 h-3" />
                    Pin
                </Button>
            )}

            {/* Remove button — host only */}
            {isHost && !s.isLocal && !isSmall && (
                <Button
                    size="sm"
                    onClick={() => kickParticipant(s.socketId)}
                    className="absolute top-2 left-2 h-7 px-2.5 gap-1.5 text-xs
                    bg-black/50 hover:bg-red-600 text-white border border-white/10
                    hover:border-red-500 backdrop-blur-sm rounded-lg
                    opacity-0 group-hover:opacity-100 transition-all duration-200
                    shadow-lg"
                >
                    <UserMinus className="w-3 h-3" />
                    Remove
                </Button>
            )}
        </div>
    );

    return (
        <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">

            {/* Header*/}
            <div className="flex items-center justify-between px-5 py-2.5 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/80 shrink-0">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-lg tracking-tight">
                        <span className="text-blue-400">CastClan</span>
                    </span>
                    <Separator orientation="vertical" className="h-5 bg-gray-700" />
                    <Badge className="bg-gray-800 hover:bg-gray-800 text-gray-300 border-0 font-mono text-xs px-3 py-1">
                        {roomCode}
                    </Badge>
                    {isHost && (
                        <Badge className="bg-blue-600/20 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs">
                            Host
                        </Badge>
                    )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {/* Timer */}
                    <div className="flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 text-gray-300 text-xs font-mono px-3 py-1.5 rounded-xl">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        {formatTime(elapsed)}
                    </div>

                    {/* Participant count */}
                    <div className="flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 text-gray-400 text-xs px-3 py-1.5 rounded-xl">
                        <Users className="w-3.5 h-3.5" />
                        {roomUserCount}
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-gray-700" />

                    {/* View toggle */}
                    <div className="flex items-center bg-gray-800/60 border border-gray-700/50 rounded-xl p-0.5 gap-0.5">
                        <Button
                            size="sm"
                            onClick={unpin}
                            className={`h-7 px-3 rounded-lg text-xs gap-1.5 transition-all ${viewMode === "grid"
                                ? "bg-blue-600 hover:bg-blue-600 text-white shadow-sm"
                                : "bg-transparent hover:bg-gray-700/50 text-gray-400 hover:text-white"
                                }`}
                        >
                            <Grid2x2 className="w-3.5 h-3.5" /> Grid
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                setViewMode("speaker");
                                if (!pinnedSocketId) {
                                    const first = allStreams.find(s => !s.isLocal) || allStreams[0];
                                    setPinnedSocketId(first?.socketId);
                                }
                            }}
                            className={`h-7 px-3 rounded-lg text-xs gap-1.5 transition-all ${viewMode === "speaker"
                                ? "bg-blue-600 hover:bg-blue-600 text-white shadow-sm"
                                : "bg-transparent hover:bg-gray-700/50 text-gray-400 hover:text-white"
                                }`}
                        >
                            <LayoutTemplate className="w-3.5 h-3.5" /> Speaker
                        </Button>
                    </div>
                    {/* Summarize Button */}
                    <Button
                        size="sm"
                        onClick={() => {
                            stopRecording();
                            setShowSummary(true);
                        }}
                        className="h-8 px-3 gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 rounded-xl transition-all duration-200"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Summarize
                    </Button>
                </div>
            </div>

            {/*Body */}
            <div className={`flex flex-1 overflow-hidden min-h-0 transition-all duration-300 ${rightPanelOpen ? "mr-80" : ""}`}>
                {viewMode === "grid" ? (
                    <VideoGrid streams={allStreams} renderTile={renderTile} />
                ) : (
                    <SpeakerView
                        streams={allStreams}
                        pinnedSocketId={pinnedSocketId || allStreams[0]?.socketId}
                        renderTile={renderTile}
                        onUnpin={unpin}
                    />
                )}
            </div>

            {/* Chat Panel */}
            {chatOpen && (
                <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-800 flex flex-col z-10">
                    <ChatPanel
                        messages={messages}
                        onSend={sendMessage}
                        username={username}
                        onClose={() => setChatOpen(false)}
                    />
                </div>
            )}

            {/*Poll Panel */}
            {pollOpen && (
                <PollPanel
                    socket={socket}
                    roomCode={roomCode}
                    isHost={isHost}
                    polls={polls}
                    questions={questions}
                    onClose={() => setPollOpen(false)}
                />
            )}

            {/*Toast*/}
            <InCallToast toast={toast} onDismiss={dismissToast} />

            {/* Control Bar */}
            <ControlBar
                cameraOn={cameraOn}
                micOn={micOn}
                sharingScreen={sharingScreen}
                chatOpen={chatOpen}
                handRaised={handRaised}
                pollOpen={pollOpen}
                unreadMessages={unreadMessages}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
                onToggleScreenShare={sharingScreen ? stopScreenShare : startScreenShare}
                onToggleChat={() => {
                    setChatOpen(p => !p);
                    if (pollOpen) { setPollOpen(false); }
                    setUnreadMessages(0);
                }}
                onToggleHand={toggleHand}
                onTogglePoll={() => {
                    setPollOpen(p => !p);
                    if (chatOpen) { setChatOpen(false); }
                }}
                onLeave={handleLeave}
                roomCode={roomCode}
            />
            {/* AI Summary */}
            {showSummary && (
                <MeetingSummaryModal
                    audioBlob={audioBlob}
                    onClose={() => setShowSummary(false)}
                />
            )}
        </div>
    );
};

export default Room;