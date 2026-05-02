import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, Loader2, Sparkles } from "lucide-react";
import client from "@/api/axios";
import ReactMarkdown from "react-markdown";

const MeetingSummaryModal = ({ audioBlob, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [error, setError] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "meeting.webm");

      const { data } = await client.post("/ai/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSummary(data.summary);
      setTranscript(data.transcript);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold text-lg">AI Meeting Summary</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Loading*/}
          {!summary && !loading && !error && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-300 font-medium mb-1">Generate Meeting Summary</p>
              <p className="text-gray-500 text-sm mb-6">
                AI will transcribe your meeting and extract key points, action items, and decisions.
              </p>
              <Button
                onClick={generateSummary}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </Button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-300 font-medium">Transcribing your meeting...</p>
              <p className="text-gray-500 text-sm mt-1">This may take 20–40 seconds</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              {error}
              <button
                onClick={generateSummary}
                className="block mt-3 text-red-300 underline hover:text-white"
              >
                Try again
              </button>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-p:text-gray-300 prose-li:text-gray-300
                prose-strong:text-white">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>

              {/* Transcript toggle */}
              <button
                onClick={() => setShowTranscript(p => !p)}
                className="mt-5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showTranscript ? "Hide" : "Show"} full transcript
              </button>

              {showTranscript && (
                <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-sm text-gray-400 max-h-40 overflow-y-auto leading-relaxed">
                  {transcript}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {summary && (
          <div className="p-4 border-t border-gray-800 shrink-0">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Summary"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingSummaryModal;