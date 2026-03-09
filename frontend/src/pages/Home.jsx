import client from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext'
import { Camera, History, Link, LogOutIcon, UserCircle2, VideoIcon } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Home = () => {
    const { user, logout } = useAuth();
    const [joinCode, setJoinCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const navigate = useNavigate();

    //Create meting
    const createMeeting = async () => {
        setLoading(true);
        try {
            const { data } = await client.post("/meeting/create");
            toast.success("Meeting created!", { description: `Code: ${data.meetingCode}` });
            navigate(`/room/${data.meetingCode}`);
        } catch (error) {
            console.error("createMeeting error", error);
            toast.error(error.response?.data?.message || "Could not create meeting. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    //Join meeting
    const joinMeeting = async () => {
        const code = joinCode.trim();
        if (!code) {
            toast.warning("Please enter a meeting code.");
            return;
        }
        try {
            const { data } = await client.post(`/meeting/join/${code}`);
            navigate(`/room/${data.meetingCode}`);
        } catch (error) {
            console.error("joinMeeting error", error);
            toast.error(error.response?.data?.message || "Could not join meeting. Check the code and try again.");
        }
    }

    //Logout 
    const handleLogout = async () => {
        setLogoutLoading(true);
        await logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-3.5 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <span className="text-2xl font-bold cursor-pointer text-blue-400 tracking-tight">CastClan</span>
                <div className="flex items-center gap-2">

                    {/* User chip */}
                    <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700/50 rounded-xl cursor-pointer px-3 py-1.5 mr-1">
                        <UserCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-gray-200 text-sm font-medium">{user?.username}</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/history")}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white hover:bg-gray-800 text-sm px-3"
                    >
                        <History className="w-4 h-4" />
                        History
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-sm px-3 disabled:opacity-50"
                    >
                        <LogOutIcon className="w-4 h-4" />
                        {logoutLoading ? "Logging out..." : "Logout"}
                    </Button>

                </div>
            </nav>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">

                {/* Hero text */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, <span className="text-blue-400">{user?.username}</span>
                    </h1>
                    <p className="text-gray-400 text-base">
                        Start a new meeting or join one with a code below.
                    </p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">

                    {/* New Meeting card */}
                    <Card
                        onClick={!loading ? createMeeting : undefined}
                        className="bg-blue-600 hover:bg-blue-500 border-0 p-6 rounded-2xl cursor-pointer transition hover:scale-[1.01]"
                    >
                        <CardContent className="p-0">
                            <div className="text-3xl mb-3"><VideoIcon /></div>
                            <h2 className="text-xl font-bold mb-1 text-white">New Meeting</h2>
                            <p className="text-blue-200 text-sm">
                                {loading ? "Starting..." : "Start an instant meeting"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Join Meeting card */}
                    <Card className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                        <CardContent className="p-0">
                            <div className="text-3xl mb-3"><Link /></div>
                            <h2 className="text-xl font-bold mb-3 text-white">Join a Meeting</h2>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter code (e.g. abc-123-xyz)"
                                    value={joinCode}
                                    onChange={e => setJoinCode(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && joinMeeting()}
                                    className="flex-1 bg-gray-800 border-0 text-white placeholder:text-gray-500 text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
                                />
                                <Button
                                    onClick={joinMeeting}
                                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium"
                                >
                                    Join
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}

export default Home