import client from '@/api/axios';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    //Fetch history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await client.get("/history");
                setHistory(res.data.history);
            } catch (error) {
                console.error("fetchHistory error:", error);
                toast.error("Could not load meeting history.")
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);
    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 py-4">
                <span
                    onClick={() => navigate("/")}
                    className="text-2xl font-bold text-blue-400 cursor-pointer"
                >
                    CastClan
                </span>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-10">

                {/* Page heading */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white">Video Call History</h2>
                </div>

                <Separator className="bg-gray-800 mb-6" />

                {/* Loading spinner */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <svg className="w-8 h-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>
                )}

                {/* Empty state */}
                {!loading && history.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-gray-400 text-sm">No calls yet. Start your first meeting!</p>
                    </div>)}
                {/* History list */}                {!loading && history.length > 0 && (
                    <div className="space-y-3">                        {history.map(h => (
                        <Card key={h.id}
                            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl transition"                            >
                            <CardContent className="flex items-center justify-between p-5">
                                {/* Left side */}                                    <div className="space-y-1">
                                    <p className="font-semibold text-white font-mono tracking-wide">                                            {h.meetingCode}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        Hosted by{" "}
                                        <span className="text-gray-300 font-medium">{h.hostedBy}</span>
                                        {" · "}
                                        {new Date(h.joinedAt).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                            hour: "2-digit", minute: "2-digit"
                                        })}
                                    </p>
                                </div>

                                {/* Right side */}
                                <div className="flex flex-col items-end gap-2">
                                    <Badge
                                        className={
                                            h.meetingEnded
                                                ? "bg-gray-800 text-gray-400 hover:bg-gray-800"
                                                : "bg-green-900/50 text-green-400 hover:bg-green-900/50"
                                        }
                                    >
                                        {h.meetingEnded ? "Ended" : "● Active"}
                                    </Badge>
                                    <p className="text-gray-500 text-xs">{h.duration}</p>
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default History