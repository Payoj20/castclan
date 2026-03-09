import prisma from "../prisma.js";
import generateCode from "../utils/generateCode.js";

//Create meeting
export const createMeeting = async (req, res) => {
  try {
    let meeting = null;

    while (!meeting) {
      const meetingCode = generateCode();
      try {
        meeting = await prisma.meeting.create({
          data: { meetingCode, hostId: req.userId },
        });
      } catch (innerError) {
        if (innerError.code !== "P2002") throw innerError;
      }
    }
    res.json({ meetingCode: meeting.meetingCode, meetingId: meeting.id });
  } catch (error) {
    console.error("createMeeting error", error);
    res
      .status(500)
      .json({ message: "Could not create meeting. Please try again." });
  }
};

//Join meeting
export const joinMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { meetingCode },
      include: {
        host: { select: { id: true, username: true } },
        participants: {
          where: { left_at: null },
          select: { userId: true },
        },
      },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found." });
    }
    if (meeting.ended_at) {
      return res
        .status(410)
        .json({ message: "This meeting has already ended." });
    }

    //Duplicate join prevention for auth user
    if (req.userId) {
      const existing = await prisma.participant.findFirst({
        where: { meetingId: meeting.id, userId: req.userId, left_at: null },
      });
      if (existing) {
        return res.json({
          success: true,
          meetingCode: meeting.meetingCode,
          meetingId: meeting.id,
          participantId: existing.id,
          host: meeting.host,
          activeParticipants: meeting.participants.length,
          isHost: req.userId === meeting.hostId,
          rejoined: true,
        });
      }
    }

    //New participant
    const participant = await prisma.participant.create({
      data: {
        meetingId: meeting.id,
        userId: req.userId,
      },
    });
    res.json({
      success: true,
      meetingCode: meeting.meetingCode,
      meetingId: meeting.id,
      participantId: participant.id,
      host: meeting.host,
      activeParticipants: meeting.participants.length,
      isHost: req.userId === meeting.hostId,
      rejoined: false,
    });
  } catch (error) {
    console.error("joinMeeting error", error);
    res
      .status(500)
      .json({ message: "Could not join meeting. Please try again." });
  }
};

//Leave meeting
export const leaveMeeting = async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: "participant id is required" });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant not found." });
    }

    //only host or participant can mark themselves as left
    if (participant.userId !== req.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot leave other participant" });
    }

    await prisma.participant.update({
      where: { id: participantId },
      data: { left_at: new Date() },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("leaveMeeting error", error);
    res.status(500).json({ message: "Could not process leave request." });
  }
};

//End meeting-host
export const endMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.params;
    const meeting = await prisma.meeting.findUnique({
      where: { meetingCode },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.hostId !== req.userId) {
      return res.status(403).json({ message: "Only host can end the meeting" });
    }
    if (meeting.ended_at) {
      return res.status(400).json({ message: "Meeting already ended" });
    }

    await prisma.meeting.update({
      where: { meetingCode },
      data: { ended_at: new Date() },
    });

    res.json({ message: "Meeting ended successfully." });
  } catch (error) {
    console.error("endMeetingHost error", error);
    res
      .status(500)
      .json({ message: "Could not end meeting. Please try again." });
  }
};

//Meeting history
export const getMyMeeting = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { hostId: req.userId },
      include: { _count: { select: { participants: true } } },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    res.json({ meetings });
  } catch (error) {
    console.error("meetingHistory error ", error);
    res.status(500).json({ message: "Could not fetch meetings." });
  }
};
