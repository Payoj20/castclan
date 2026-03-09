import prisma from "../prisma.js";

export const getHistory = async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      where: { userId: req.userId },
      include: {
        meeting: {
          include: { host: { select: { username: true } } },
        },
      },
      orderBy: { joined_at: "desc" },
      take: 30,
    });

    const history = participants.map((p) => {
      const durationMs = p.left_at
        ? new Date(p.left_at) - new Date(p.joined_at)
        : null;
      const durationMin = durationMs ? Math.round(durationMs / 60000) : null;

      return {
        id: p.id,
        meetingCode: p.meeting.meetingCode,
        hostedBy: p.meeting.host.username,
        isHost: p.meeting.hostId === req.userId,
        joinedAt: p.joined_at,
        leftAt: p.left_at,
        duration: durationMin ? `${durationMin} min` : "In progress",
        meetingEnded: !!p.meeting.ended_at,
      };
    });

    res.json({ history });
  } catch (error) {
    console.error("History error", error);
    res.status(500).json({ message: "Could not fetch meeting history." });
  }
};
