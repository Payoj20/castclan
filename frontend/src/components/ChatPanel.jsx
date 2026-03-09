import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";

export default function ChatPanel({ messages, onSend, username, onClose }) {
    const [text, setText] = useState("");
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-white font-semibold">In-call messages</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white hover:bg-transparent text-xl p-1 h-auto"
                >
                    ✕
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-3">
                    {messages.length === 0 && (
                        <p className="text-gray-500 text-sm text-center mt-8">
                            Messages only visible to people in this call
                        </p>
                    )}
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex flex-col ${m.username === username ? "items-end" : "items-start"}`}
                        >
                            <span className="text-xs text-gray-400 mb-1">{m.username}</span>
                            <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] ${m.username === username
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-gray-100"
                                }`}>
                                {m.message}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            <Separator className="bg-gray-800" />

            {/* Input */}
            <div className="px-4 py-3 flex gap-2">
                <Input
                    className="flex-1 bg-gray-800 border-0 text-white placeholder:text-gray-500 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                    placeholder="Send a message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                />
                <Button
                    onClick={send}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl"
                >
                    Send
                </Button>
            </div>
        </>
    );
}