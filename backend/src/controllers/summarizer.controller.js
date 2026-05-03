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
          content: `You are a meeting transcription assistant. Given a meeting audio transcript, format it as a play-style script and extract insights.

Format your response EXACTLY like this:

## Meeting Transcript (Play Format)
[Participant 1]: What they said...
[Participant 2]: Their response...
(Continue for the full conversation, alternating speakers based on when voice/tone changes)

## Summary
3-5 sentence overview of the entire meeting.

## Key Points
- Main discussion point 1
- Main discussion point 2

## Action Items
- Task description (owner if mentioned)

## Decisions Made
- Decision 1

Important: Whisper cannot identify individual speakers by name, so label them as [Participant 1], [Participant 2] etc based on voice changes. If only one voice is detected, label as [Participant 1] only.`,
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
