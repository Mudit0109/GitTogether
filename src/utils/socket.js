const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstname, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstname + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
  "sendMessage",
  async ({ firstname, lastname, userId, targetUserId, text }) => {
    try {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstname + " " + text);

      let chat = await Chat.findOne({
        participants: { $all: [userId, targetUserId] },
      });

      if (!chat) {
        chat = new Chat({
          participants: [userId, targetUserId],
          messages: [],
        });
      }

      // Create new message
      const newMessage = {
        senderId: userId,
        text,
      };

      chat.messages.push(newMessage);

      await chat.save();

      // Get the last message (which includes timestamps)
      const savedMessage = chat.messages[chat.messages.length - 1];

      io.to(roomId).emit("messageReceived", {
        firstname,
        lastname,
        text: savedMessage.text,
        createdAt: savedMessage.createdAt, // ⬅️ send correct timestamp
      });
    } catch (err) {
      console.log(err);
    }
  }
);

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;