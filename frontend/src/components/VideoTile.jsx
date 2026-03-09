import { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MicOff, Pin } from "lucide-react";


export default function VideoTile({ stream, username, isLocal, cameraOn = true, micOn = true, raisedHand = false, isPinned = false }) {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && stream)
            videoRef.current.srcObject = stream
    }, [stream, cameraOn]);

    return (
        <Card className={`relative bg-gray-900 border-0 rounded-2xl overflow-hidden flex items-center justify-center w-full h-full min-h-40 ${isPinned ? "ring-2 ring-blue-500" : ""}`}>

            {/* Video */}
            {cameraOn && stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={isLocal}
                    playsInline
                    className="w-full h-full object-contain bg-gray-950"
                />
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                            {username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-400 text-sm">Camera off</span>
                </div>
            )}

            {/* Bottom bar — name + mic status */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge className="bg-black/60 hover:bg-black/60 text-white text-xs font-normal">
                    {username}
                </Badge>
                {!micOn && (
                    <Badge className="bg-red-600/80 hover:bg-red-600/80 text-white text-xs">
                        <MicOff size="1rem" />
                    </Badge>
                )}
            </div>

            {/* Raised hand */}
            {raisedHand && (
                <div className="absolute top-3 right-3 text-2xl animate-bounce">✋</div>
            )}

            {/* Pinned badge */}
            {isPinned && (
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-blue-600/80 backdrop-blur-sm border border-blue-400/30 text-white text-[10px] font-medium px-2 py-1 rounded-lg shadow-lg">
                    <Pin className="w-3 h-3" />
                    Pinned
                </div>
            )}

        </Card>
    )
}