import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { BarChart2, CheckCircle2, ChevronUp, CircleDot, HelpCircle, Plus, Send, Trash2, X, XCircle } from "lucide-react";
import { Separator } from "./ui/separator";

const PollOption = ({ option, showResults, pct, isMyVote, isCorrect, isWrong, onClick, disabled }) => (
    <Button
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left rounded-xl overflow-hidden border transition-all duration-200 group
            ${showResults && isCorrect ? "border-emerald-500/70 bg-emerald-950/20"
                : showResults && isWrong ? "border-red-500/70 bg-red-950/20"
                    : isMyVote ? "border-blue-500/70 bg-blue-950/20"
                        : disabled ? "border-gray-700/50 bg-gray-800/40 cursor-default"
                            : "border-gray-700/50 bg-gray-800/40 hover:border-gray-500 hover:bg-gray-800/80 cursor-pointer"}`}
    >
        <div className="relative px-4 py-3">
            {/* Progress fill */}
            {showResults && (
                <div
                    className={`absolute inset-0 transition-all duration-500 ${isCorrect ? "bg-emerald-500/10" :
                        isWrong ? "bg-red-500/10" : "bg-blue-500/10"
                        }`}
                    style={{ width: `${pct}%` }}
                />
            )}
            <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {showResults && isWrong && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    {!showResults && (
                        <CircleDot className={`w-4 h-4 shrink-0 ${isMyVote ? "text-blue-400" : "text-gray-600 group-hover:text-gray-400"}`} />
                    )}
                    <span className={`text-sm font-medium ${showResults && isCorrect ? "text-emerald-300"
                        : showResults && isWrong ? "text-red-300"
                            : "text-gray-200"
                        }`}>
                        {option}
                    </span>
                </div>
                {showResults && (
                    <span className={`text-xs font-semibold tabular-nums shrink-0 ${isCorrect ? "text-emerald-400" : isWrong ? "text-red-400" : "text-gray-400"
                        }`}>
                        {pct}%
                    </span>
                )}
            </div>
        </div>
    </Button>
);

//Question card
const QuestionCard = ({ q, isHost, onUpvote, onMarkAnswer }) => (
    <Card className={`bg-gray-800/60 border border-gray-700/50 rounded-xl transition-all ${q.answered ? "opacity-40" : ""}`}>
        <CardContent className="p-4 space-y-3">
            <p className="text-gray-100 text-sm leading-relaxed">{q.question}</p>
            <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 text-xs">— {q.askedBy}</span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpvote(q.id)}
                        className="h-7 px-2 gap-1.5 text-xs text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                    >
                        <ChevronUp className="w-3.5 h-3.5" />
                        {q.upvotes.length}
                    </Button>
                    {q.answered ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-0 hover:bg-emerald-500/15 text-xs px-2 py-0.5 gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Answered
                        </Badge>
                    ) : isHost && (
                        <Button
                            size="sm"
                            onClick={() => onMarkAnswer(q.id)}
                            className="h-7 px-2.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg"
                        >
                            Mark answered
                        </Button>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function PollPanel({ socket, roomCode, isHost, polls, questions, onClose }) {
    const [tab, setTab] = useState("polls");
    const [newQuestion, setNewQuestion] = useState("");
    const [creatingPoll, setCreatingPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [votedPolls, setVotedPolls] = useState({});

    const unansweredCount = questions.filter(q => !q.answered).length;

    const submitQuestion = () => {
        if (!newQuestion.trim()) { return; }
        socket?.emit("ask-question", { roomCode, question: newQuestion.trim() });
        setNewQuestion("");
    };

    const voteOnPoll = (pollId, optionIndex) => {
        if (votedPolls[pollId] !== undefined) { return; }
        setVotedPolls(prev => ({ ...prev, [pollId]: optionIndex }));
        socket?.emit("vote-poll", { roomCode, pollId, optionIndex });
    };

    const createPoll = () => {
        const validOptions = pollOptions.filter(o => o.trim());
        if (!pollQuestion.trim() || validOptions.length < 2) { return; }
        socket?.emit("create-poll", {
            roomCode,
            question: pollQuestion.trim(),
            options: validOptions,
            correctAnswer: correctAnswer
        });
        setPollQuestion("");
        setPollOptions(["", ""]);
        setCorrectAnswer(null);
        setCreatingPoll(false);
    };

    const addOption = () => {
        if (pollOptions.length >= 6) { return; }
        setPollOptions([...pollOptions, ""]);
    };

    const removeOption = (i) => {
        if (pollOptions.length <= 2) { return; }
        const next = pollOptions.filter((_, idx) => idx !== i);
        setPollOptions(next);
        if (correctAnswer === i) {
            setCorrectAnswer(null);
        } else if (correctAnswer > i) {
            setCorrectAnswer(correctAnswer - 1);
        }
        if (correctAnswer !== null && correctAnswer >= next.length) {
            setCorrectAnswer(null);
        }
    };

    const closePoll = (pollId) => socket?.emit("close-poll", { roomCode, pollId });
    const upvote = (questionId) => socket?.emit("upvote-question", { roomCode, questionId });
    const markAnswer = (questionId) => socket?.emit("mark-answered", { roomCode, questionId });

    return (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-950 border-l border-gray-800/80 flex flex-col z-20 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-gray-900/50">
                <div className="flex items-center gap-1 bg-gray-800/60 p-1 rounded-xl border border-gray-700/50">
                    <Button
                        size="sm"
                        onClick={() => setTab("polls")}
                        className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${tab === "polls"
                            ? "bg-blue-600 hover:bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                            : "bg-transparent hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                        Polls
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setTab("qa")}
                        className={`relative h-7 px-3 rounded-lg text-xs font-medium transition-all ${tab === "qa"
                            ? "bg-blue-600 hover:bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                            : "bg-transparent hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                        Q&A
                        {unansweredCount > 0 && (
                            <Badge className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center p-0 font-bold border-0">
                                {unansweredCount > 9 ? "9+" : unansweredCount}
                            </Badge>
                        )}
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="w-7 h-7 p-0 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/*Polls Tab */}
            {tab === "polls" && (
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">

                        {/* Create poll — host only */}
                        {isHost && !creatingPoll && (
                            <Button
                                onClick={() => setCreatingPoll(true)}
                                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 hover:border-blue-400/50 text-sm font-medium rounded-xl h-10 gap-2"
                            >
                                <Plus className="w-4 h-4" /> Create Poll
                            </Button>
                        )}

                        {/* Poll creator form */}
                        {isHost && creatingPoll && (
                            <Card className="bg-gray-900/80 border border-gray-700/60 rounded-xl">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest">New Poll</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setCreatingPoll(false); setCorrectAnswer(null); setPollOptions(["", ""]); }}
                                            className="w-6 h-6 p-0 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded-lg"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    <Input
                                        className="bg-gray-800/80 border-gray-700/60 text-white placeholder:text-gray-500 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg"
                                        placeholder="Ask the audience..."
                                        value={pollQuestion}
                                        onChange={e => setPollQuestion(e.target.value)}
                                    />

                                    <div className="space-y-2">
                                        <p className="text-gray-500 text-[11px] flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            Click circle to mark correct answer
                                        </p>
                                        {pollOptions.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCorrectAnswer(prev => prev === i ? null : i)}
                                                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${correctAnswer === i
                                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                                        : "border-gray-600 hover:border-emerald-500/60"
                                                        }`}
                                                >
                                                    {correctAnswer === i && <CheckCircle2 className="w-3 h-3" />}
                                                </button>
                                                <Input
                                                    className="flex-1 bg-gray-800/80 border-gray-700/60 text-white placeholder:text-gray-500 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg h-9"
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const n = [...pollOptions];
                                                        n[i] = e.target.value;
                                                        setPollOptions(n);
                                                    }}
                                                />
                                                {pollOptions.length > 2 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeOption(i)}
                                                        className="w-7 h-7 p-0 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {pollOptions.length < 6 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={addOption}
                                            className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add option
                                        </Button>
                                    )}

                                    <Separator className="bg-gray-700/50" />

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={createPoll}
                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg h-9 shadow-sm shadow-blue-500/20"
                                        >
                                            Launch
                                        </Button>
                                        <Button
                                            onClick={() => { setCreatingPoll(false); setCorrectAnswer(null); setPollOptions(["", ""]); }}
                                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg h-9 border border-gray-700/50"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {polls.length === 0 && !creatingPoll && (
                            <div className="text-center py-12 space-y-2">
                                <BarChart2 className="w-8 h-8 text-gray-700 mx-auto" />
                                <p className="text-gray-500 text-sm">
                                    {isHost ? "Create your first poll above" : "No polls yet"}
                                </p>
                            </div>
                        )}

                        {/* Poll list */}
                        {polls.map(poll => {
                            const totalVotes = Object.values(poll.votes || {}).reduce((sum, v) => sum + v.length, 0);
                            const myVote = votedPolls[poll.id];
                            const hasVoted = myVote !== undefined;
                            const showResults = hasVoted || !poll.active;

                            return (
                                <Card key={poll.id} className={`bg-gray-900/60 border border-gray-700/50 rounded-xl ${!poll.active ? "opacity-60" : ""}`}>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-gray-100 text-sm font-medium leading-snug">{poll.question}</p>
                                            {!poll.active && (
                                                <Badge className="shrink-0 bg-gray-700/60 text-gray-400 border-0 hover:bg-gray-700/60 text-[10px]">
                                                    Ended
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            {poll.options.map((option, i) => {
                                                const voteCount = (poll.votes?.[i] || []).length;
                                                const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                                                return (
                                                    <PollOption
                                                        key={i}
                                                        option={option}
                                                        index={i}
                                                        showResults={showResults}
                                                        pct={pct}
                                                        isMyVote={myVote === i}
                                                        isCorrect={poll.correctAnswer === i}
                                                        isWrong={hasVoted && myVote === i && poll.correctAnswer !== null && poll.correctAnswer !== i}
                                                        onClick={() => !showResults && voteOnPoll(poll.id, i)}
                                                        disabled={showResults}
                                                    />
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-500 text-xs">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
                                            {!hasVoted && poll.active && (
                                                <p className="text-gray-600 text-xs">Tap to vote</p>
                                            )}
                                        </div>

                                        {showResults && poll.correctAnswer !== null && poll.options[poll.correctAnswer] && (
                                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg">
                                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                Correct: {poll.options[poll.correctAnswer]}
                                            </div>
                                        )}

                                        {isHost && poll.active && (
                                            <Button
                                                onClick={() => closePoll(poll.id)}
                                                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-xs rounded-lg h-8 border border-gray-700/50"
                                            >
                                                End Poll
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </ScrollArea>
            )}

            {/* sQ&A Tab */}
            {tab === "qa" && (
                <div className="flex flex-col flex-1 overflow-hidden">

                    {isHost && unansweredCount > 0 && (
                        <div className="mx-4 mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs px-3 py-2 rounded-xl">
                            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                            {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} awaiting your response
                        </div>
                    )}

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-2.5">
                            {questions.length === 0 && (
                                <div className="text-center py-12 space-y-2">
                                    <HelpCircle className="w-8 h-8 text-gray-700 mx-auto" />
                                    <p className="text-gray-500 text-sm">No questions yet</p>
                                </div>
                            )}
                            {[...questions]
                                .sort((a, b) => {
                                    if (a.answered !== b.answered) { return a.answered ? 1 : -1; }
                                    return b.upvotes.length - a.upvotes.length;
                                })
                                .map(q => (
                                    <QuestionCard
                                        key={q.id}
                                        q={q}
                                        isHost={isHost}
                                        onUpvote={upvote}
                                        onMarkAnswer={markAnswer}
                                    />
                                ))}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-gray-800/80 bg-gray-900/30">
                        <div className="flex gap-2">
                            <Input
                                className="flex-1 bg-gray-800/80 border-gray-700/60 text-white placeholder:text-gray-500 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                                placeholder="Ask the host something..."
                                value={newQuestion}
                                onChange={e => setNewQuestion(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && submitQuestion()}
                            />
                            <Button
                                onClick={submitQuestion}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3 shadow-sm shadow-blue-500/20"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}