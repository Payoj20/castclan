import { BarChart2, Copy, Hand, LogOut, MessageSquare, Mic, MicOff, Monitor, MonitorOff, Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

const ControlBtn = ({ onClick, icon: Icon, label, active = false, danger = false, warning = false }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                onClick={onClick}
                className={`
                    flex flex-col items-center justify-center gap-1.5
                    w-14 h-14 rounded-2xl p-0 font-medium transition-all duration-200
                    ${danger
                        ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:scale-105"
                        : warning
                            ? "bg-yellow-500 hover:bg-yellow-400 text-white shadow-lg shadow-yellow-500/30 hover:scale-105"
                            : active
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
                                : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600"
                    }
                `}
            >
                <Icon className="w-5 h-5" strokeWidth={1.75} />
                <span className="text-[10px] leading-none font-medium tracking-wide">{label}</span>
            </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-800 border-gray-700 text-gray-200 text-xs">
            {label}
        </TooltipContent>
    </Tooltip>
);

export default function ControlBar({
    cameraOn, micOn, sharingScreen, chatOpen,
    handRaised, pollOpen,
    onToggleCamera, onToggleMic, onToggleScreenShare,
    onToggleChat, onToggleHand, onTogglePoll,
    onLeave, roomCode, unreadMessages = 0
}) {
    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex items-center justify-center gap-2 py-4 px-6 bg-gray-950 border-t border-gray-800/80">

                {/* Media controls buttons */}
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-2xl px-3 py-2">
                    <ControlBtn onClick={onToggleMic} icon={micOn ? Mic : MicOff} label={micOn ? "Mute" : "Unmute"} active={micOn} />
                    <ControlBtn onClick={onToggleCamera} icon={cameraOn ? Video : VideoOff} label={cameraOn ? "Camera" : "Off"} active={cameraOn} />
                    <ControlBtn onClick={onToggleScreenShare} icon={sharingScreen ? MonitorOff : Monitor} label={sharingScreen ? "Stop" : "Share"} active={sharingScreen} />
                </div>

                <Separator orientation="vertical" className="h-10 bg-gray-800" />

                {/* Interaction controls buttons */}
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-2xl px-3 py-2">
                    <div className="relative">
                        <ControlBtn onClick={onToggleChat} icon={MessageSquare} label="Chat" active={chatOpen} />
                        {unreadMessages > 0 && !chatOpen && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none z-10">
                                {unreadMessages > 9 ? "9+" : unreadMessages}
                            </span>
                        )}
                    </div>
                    <ControlBtn onClick={onTogglePoll} icon={BarChart2} label="Polls" active={pollOpen} />
                    <ControlBtn onClick={onToggleHand} icon={Hand} label={handRaised ? "Lower" : "Raise"} warning={handRaised} />
                </div>

                <Separator orientation="vertical" className="h-10 bg-gray-800" />

                {/* Utility controls buttons */}
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-2xl px-3 py-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(roomCode); toast.success("Room code copied!", {
                                        description: roomCode,
                                        duration: 2500,
                                    });
                                }}
                                className="flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-2xl p-0 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600 transition-all duration-200"
                            >
                                <Copy className="w-5 h-5" strokeWidth={1.75} />
                                <span className="text-[10px] leading-none font-medium tracking-wide">Copy</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-800 border-gray-700 text-gray-200 text-xs">
                            Copy room code
                        </TooltipContent>
                    </Tooltip>

                    <ControlBtn onClick={() => {
                        toast("Leaving meeting...", { duration: 1500 });
                        setTimeout(onLeave, 400);
                    }} icon={LogOut} label="Leave" danger />
                </div>

            </div>
        </TooltipProvider>
    );
}