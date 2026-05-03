import Groq from "groq-sdk";
import fs from "fs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const summarizeMeeting = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!filePath) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    // Read file into buffer and wrap with correct filename/mimetype
    const fileBuffer = fs.readFileSync(filePath);
    const audioFile = new File(
      [fileBuffer],
      req.file.originalname || "audio.mp3",
      { type: req.file.mimetype || "audio/mpeg" },
    );

    // Transcribe
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      response_format: "json",
    });

    const transcript = transcription.text;

    // Summarize
    const summaryResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a meeting assistant. Given a meeting transcript, provide:

## Summary
2-3 sentences maximum. Be very concise — just the core topic and outcome.

## Key Points
- Maximum 4 bullet points only

## Action Items
- Tasks mentioned (if none, write "None identified")

## Decisions Made
- Decisions reached (if none, write "None identified")

## Full Transcript
[Participant 1]: what they said...
[Participant 2]: their response...
(Label speakers by voice changes. Keep this section complete and uncut.)

IMPORTANT: Keep Summary, Key Points, Action Items, and Decisions Made very short and concise. Only the Full Transcript section should be long.`,
        },
        {
          role: "user",
          content: `Here is the meeting transcript:\n\n${transcript}`,
        },
      ],
    });

    const summary = summaryResponse.choices[0].message.content;

    return res.json({ transcript, summary });
  } catch (error) {
    console.error("AI Summarizer error:", error);
    return res.status(500).json({ message: "Failed to process audio" });
  } finally {
    // Always cleanup
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};
