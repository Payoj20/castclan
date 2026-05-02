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
      { type: req.file.mimetype || "audio/mpeg" }
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
          content: `You are a meeting assistant. Given a meeting transcript, extract:
1. **Summary** - 3-5 sentence overview
2. **Key Points** - bullet list of main discussion points
3. **Action Items** - bullet list of tasks with owners if mentioned
4. **Decisions Made** - any conclusions reached
Format your response in clean markdown.`,
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