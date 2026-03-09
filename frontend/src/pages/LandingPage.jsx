
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
    Video, MessageSquare, Monitor, BarChart2, HelpCircle,
    Hand, Pin, Shield, ArrowRight, Users, Zap,
    CheckCircle, Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
    { icon: Video, title: "Video Calling", desc: "Crystal-clear peer-to-peer video for up to 6 participants powered by WebRTC." },
    { icon: MessageSquare, title: "In-Call Chat", desc: "Real-time messaging without ever interrupting the conversation flow." },
    { icon: Monitor, title: "Screen Sharing", desc: "One-click screen sharing with full audio support for presentations." },
    { icon: BarChart2, title: "Live Polls", desc: "Launch instant polls with correct-answer reveal and live result tracking." },
    { icon: HelpCircle, title: "Q&A Sessions", desc: "Structured Q&A with upvoting so the best questions surface first." },
    { icon: Hand, title: "Raise Hand", desc: "Signal the host without breaking the flow of conversation." },
    { icon: Pin, title: "Speaker View", desc: "Pin any participant and switch to focused speaker mode instantly." },
    { icon: Shield, title: "Secure by Default", desc: "JWT auth, rate limiting, input validation, and ownership checks built in." },
];

const steps = [
    { icon: Users, title: "Create an account", desc: "Sign up in seconds — just an email, username and password." },
    { icon: Zap, title: "Start or join a meeting", desc: "Create an instant meeting or paste a code shared by your host." },
    { icon: CheckCircle, title: "Collaborate freely", desc: "Everything you need is already inside — no plugins, no extras." },
];

const stats = [
    { value: "6", label: "Participants per call" },
    { value: "<1s", label: "Join time" },
    { value: "100%", label: "Free forever" },
];

export default function LandingPage() {
    const scrollTo = (id) =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    return (
        <div className="min-h-screen bg-[#080C14] text-white font-sans antialiased">

            {/*Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-50 left-1/2 -translate-x-1/2 w-225 h-150 bg-blue-600/8 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] -right-25 w-100 h-100 bg-violet-600/6 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] -left-20px w-87.5 h-87.5 bg-cyan-600/5 rounded-full blur-[100px]" />
                {/*Grid Lines*/}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px"
                    }}
                />
            </div>

            {/* Navbar*/}
            <nav className="z-50 sticky top-0 bg-[#080C14]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <Video className="w-4 h-4 text-white" />
                        </div>
                        <Link to="/" className="text-xl font-bold tracking-tight text-blue-400">CastClan</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        {["features", "how"].map(id => (
                            <button
                                key={id}
                                onClick={() => scrollTo(id)}
                                className="text-[13px] text-gray-400 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5 capitalize"
                            >
                                {id === "how" ? "How it works" : "Features"}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-gray-400 hover:text-white hover:bg-white/5 text-[13px]"
                        >
                            <Link to="/login">Log in</Link>
                        </Button>
                        <Button
                            size="sm"
                            asChild
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[13px] font-semibold px-4 shadow-lg shadow-blue-600/20"
                        >
                            <Link to="/signup" className="flex items-center gap-1.5">
                                Get started <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/*Hero  Section*/}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-xs px-4 py-2 rounded-full mb-10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Free to use · No downloads · No plugins
                </div>

                <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.95] tracking-tight">
                    <span className="text-white">Connect, <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                        Cast,
                    </span> Collaborate.</span>
                    <br />
                </h1>

                <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light">
                    HD video, real-time chat, live polls, Q&A and screen sharing —
                    all in one place, free forever.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
                    <Button
                        size="lg"
                        asChild
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 h-12 rounded-xl text-base shadow-2xl shadow-blue-600/25 transition hover:scale-[1.02]"
                    >
                        <Link to="/signup" className="flex items-center gap-2">
                            <Play className="w-4 h-4 fill-white" />
                            Start for free
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium px-8 h-12 rounded-xl text-base backdrop-blur-sm"
                    >
                        <Link to="/login">Log in to your account</Link>
                    </Button>
                </div>

                {/*Stats  */}
                <div className="inline-flex items-center gap-0 bg-white/4 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {stats.map((s, i) => (
                        <div key={s.label} className="flex items-center">
                            <div className="px-8 py-4 text-center">
                                <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                                <div className="text-gray-500 text-xs mt-0.5 font-medium">{s.label}</div>
                            </div>
                            {i < stats.length - 1 && (
                                <div className="w-px h-10 bg-white/8" />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/*Features Section*/}
            <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-3">
                        Features
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Everything in one room
                    </h2>
                    <p className="text-gray-400 text-lg max-w-lg mx-auto font-light">
                        No paid tiers. No feature gates. Everything unlocked from the moment you join.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        if (i === 0) return (
                            <Card
                                key={f.title}
                                className="md:col-span-2 lg:col-span-1 bg-linear-to-br from-blue-600/15 to-violet-600/10 border border-blue-500/20 rounded-2xl group hover:border-blue-500/40 transition-all duration-300"
                            >
                                <CardContent className="p-7">
                                    <div className="w-11 h-11 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600/30 transition">
                                        <Icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                                </CardContent>
                            </Card>
                        );

                        return (
                            <Card
                                key={f.title}
                                className="bg-white/3 border border-white/8 rounded-2xl group hover:border-white/15 hover:bg-white/5 transition-all duration-300"
                            >
                                <CardContent className="p-7">
                                    <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-white/8 transition">
                                        <Icon className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="relative z-10 border-y border-white/5 bg-white/1.5">
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-3">
                            Getting started
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Up in 30 seconds
                        </h2>
                        <p className="text-gray-400 text-lg font-light">
                            Three steps. No configuration required.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="relative">
                                    {/* Connector */}
                                    {i < steps.length - 1 && (
                                        <div className="hidden md:block absolute top-7 left-[calc(50%+44px)] right-[-50%] h-px bg-linear-to-r from-white/15 to-transparent z-10" />
                                    )}
                                    <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center hover:border-white/15 transition-all duration-300 group">
                                        <div className="relative inline-flex mb-6">
                                            <div className="w-14 h-14 bg-linear-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center group-hover:from-blue-600/30 transition-all">
                                                <Icon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-[10px] font-black text-white">{i + 1}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Highlights*/}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    {[
                        { icon: Shield, text: "JWT authenticated" },
                        { icon: Zap, text: "WebRTC peer-to-peer" },
                        { icon: CheckCircle, text: "No credit card required" },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2.5 text-gray-400">
                            <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="text-sm font-medium">{text}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Banner */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
                <div className="relative overflow-hidden rounded-3xl">
                    {/* Background */}
                    <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-violet-800" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 px-8 py-20 text-center">
                        <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/15 text-xs font-semibold tracking-wide uppercase mb-6">
                            Free forever
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                            Ready to meet?
                        </h2>
                        <p className="text-blue-100/80 text-lg mb-10 max-w-lg mx-auto font-light">
                            Create your account in seconds and host unlimited meetings with every feature unlocked.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button
                                size="lg"
                                asChild
                                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 h-13 rounded-xl text-base hover:scale-[1.02] transition shadow-2xl"
                            >
                                <Link to="/signup" className="flex items-center gap-2">
                                    Create free account <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="border-white/25 bg-white/10 hover:bg-white/20 text-white font-medium px-8 h-13 rounded-xl text-base backdrop-blur-sm"
                            >
                                <Link to="/login">Log in instead</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/6">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Video className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold text-white text-lg tracking-tight">CastClan</span>
                            <span className="text-gray-600 text-sm">— Free, open, real-time meetings</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {[
                                { label: "Features", id: "features" },
                                { label: "How it works", id: "how" },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollTo(item.id)}
                                    className="text-gray-500 hover:text-white text-sm transition px-4 py-2 rounded-lg hover:bg-white/5"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-white/5 mb-8" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-gray-600 text-xs">
                            © {new Date().getFullYear()} CastClan. All right reserved.
                        </p>
                        <div className="flex items-center gap-1.5">
                            {["React", "Node.js", "WebRTC", "Socket.IO", "Prisma ORM", "Postgres"].map(tech => (
                                <Badge
                                    key={tech}
                                    className="bg-white/4 text-gray-500 border-white/8 hover:bg-white/4 text-[10px] font-medium"
                                >
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}