import prisma from "../prisma.js";

export const socketHandler = (io) => {
  //roomcode - map of socketId - username, userId, participantId
  const rooms = new Map();

  //Socket connection
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    //Join room
    //ParticipantId comes from the frontend
    //Socket never creates Db records - pure real-time only
    socket.on("join-room", ({ roomCode, username, userId, participantId }) => {
      socket.join(roomCode);
      socket.roomCode = roomCode;
      socket.username = username;
      socket.userId = userId;
      socket.participantId = participantId || null;

      //Register socket in the room
      if (!rooms.has(roomCode)) rooms.set(roomCode, new Map());
      rooms.get(roomCode).set(socket.id, { username, userId, participantId });

      //Notify user about all existing peers
      const existingPeers = [...rooms.get(roomCode).entries()]
        .filter(([id]) => id !== socket.id)
        .map(([id, data]) => ({ socketId: id, username: data.username }));
      socket.emit("existing-peers", existingPeers);

      //Notify existing peer about new user
      socket
        .to(roomCode)
        .emit("peer-joined", { socketId: socket.id, username });

      //Broadcast updated participant count
      io.to(roomCode).emit("room-users", rooms.get(roomCode).size);
    });

    //WebRTC signaling

    //Forward the offer to the specific peer
    socket.on("offer", ({ offer, toSocketId }) => {
      io.to(toSocketId).emit("offer", {
        offer,
        fromSocketId: socket.id,
        username: socket.username,
      });
    });

    //Forward the answer back to the user who sent the offer
    socket.on("answer", ({ answer, toSocketId }) => {
      io.to(toSocketId).emit("answer", {
        answer,
        fromSocketId: socket.id,
      });
    });

    //Exchange network path
    socket.on("ice-candidate", ({ candidate, toSocketId }) => {
      io.to(toSocketId).emit("ice-candidate", {
        candidate,
        fromSocketId: socket.id,
      });
    });

    //In call chat
    socket.on("send-message", ({ roomCode, message }) => {
      io.to(roomCode).emit("receive-message", {
        message,
        username: socket.username,
        socketId: socket.id,
        time: new Date().toISOString(),
      });
    });

    //Screen share
    socket.on("screen-share-on", ({ roomCode }) => {
      socket.to(roomCode).emit("peer-screen-share", {
        socketId: socket.id,
        sharing: true,
      });
    });

    socket.on("screen-share-off", ({ roomCode }) => {
      socket.to(roomCode).emit("peer-screen-share", {
        socketId: socket.id,
        sharing: false,
      });
    });

    //Media state (camera/mic)
    socket.on("media-state", ({ roomCode, cameraOn, micOn }) => {
      socket.to(roomCode).emit("peer-media-state", {
        socketId: socket.id,
        cameraOn,
        micOn,
      });
    });

    //Raise hand
    socket.on("raise-hand", ({ roomCode }) => {
      socket.to(roomCode).emit("peer-raised-hand", {
        socketId: socket.id,
        username: socket.username,
      });
    });

    socket.on("lower-hand", ({ roomCode }) => {
      socket.to(roomCode).emit("peer-lowered-hand", {
        socketId: socket.id,
      });
    });

    // Kick participant - host only
    socket.on("kick-user", ({ roomCode, targetSocketId }) => {
      // Verify kicker is the host
      const meeting_rooms = rooms.get(roomCode);
      if (!meeting_rooms) return;

      // Notify the kicked user
      io.to(targetSocketId).emit("you-were-kicked");

      // Notify everyone else
      socket.to(roomCode).emit("peer-left", { socketId: targetSocketId });

      // Force the kicked socket to leave the room
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.leave(roomCode);
        meeting_rooms.delete(targetSocketId);
        io.to(roomCode).emit("room-users", meeting_rooms.size);
      }
    });

    //Polls
    //Create-poll
    socket.on(
      "create-poll",
      ({ roomCode, question, options, correctAnswer }) => {
        const poll = {
          id: Date.now().toString(),
          question,
          options,
          correctAnswer: correctAnswer ?? null,
          votes: {},
          createdBy: socket.username,
          active: true,
        };
        io.to(roomCode).emit("poll-created", poll);
      },
    );

    //Vote poll
    socket.on("vote-poll", ({ roomCode, pollId, optionIndex }) => {
      io.to(roomCode).emit("poll-vote-received", {
        pollId,
        optionIndex,
        username: socket.username,
      });
    });

    //Host close poll
    socket.on("close-poll", ({ roomCode, pollId }) => {
      io.to(roomCode).emit("poll-closed", { pollId });
    });

    // Q&A
    socket.on("ask-question", ({ roomCode, question }) => {
      const q = {
        id: Date.now().toString(),
        question,
        askedBy: socket.username,
        answered: false,
        upvotes: [],
      };
      io.to(roomCode).emit("question-received", q);
    });

    //Upvote the questions
    socket.on("upvote-question", ({ roomCode, questionId }) => {
      io.to(roomCode).emit("question-upvoted", {
        questionId,
        username: socket.username,
      });
    });

    //Mark question as answered
    socket.on("mark-answered", ({ roomCode, questionId }) => {
      io.to(roomCode).emit("question-answered", { questionId });
    });

    //Disconnect
    socket.on("disconnect", async () => {
      const { roomCode, participantId, userId } = socket;
      if (!roomCode) return;

      //update in memory room map
      if (rooms.has(roomCode)) {
        rooms.get(roomCode).delete(socket.id);
        if (rooms.get(roomCode).size === 0) rooms.delete(roomCode);
        else io.to(roomCode).emit("room-users", rooms.get(roomCode).size);
      }

      //Notify remaining peers
      socket.to(roomCode).emit("peer-left", { socketId: socket.id });

      //Auto-end if host disconnected - meeting ended and notify all peers
      try {
        const meeting = await prisma.meeting.findUnique({
          where: { meetingCode: roomCode },
        });
        if (
          meeting &&
          !meeting.ended_at &&
          userId &&
          meeting.hostId === userId
        ) {
          await prisma.meeting.update({
            where: { meetingCode: roomCode },
            data: { ended_at: new Date() },
          });
          io.to(roomCode).emit("meeting-ended", {
            reason: "Host left the meeting",
          });
        }
      } catch (error) {
        console.error("Error on disconnect:", error);
      }

      // Update participant left_at using participantId
      // Update, never a create
      if (participantId) {
        try {
          await prisma.participant.update({
            where: { id: participantId },
            data: { left_at: new Date() },
          });
        } catch (error) {
          console.error("Error updating participant left_at:", error);
        }
      }
    });
  });
};
