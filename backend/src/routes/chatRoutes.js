import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middlewares/authMiddleware.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { decryptMessage, encryptMessage } from "../lib/chatEncryption.js";
import { getSocketServer } from "../lib/socket.js";

const router = express.Router();

const getConversationForUsers = async (userId, participantId) => {
  return Conversation.findOne({
    participants: { $all: [userId, participantId] },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  });
};

const isParticipant = (conversation, userId) =>
  conversation.participants.some((participant) => participant.toString() === userId.toString());

const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  profileImage: user.profileImage,
});

const formatMessage = (message) => ({
  _id: message._id,
  conversation: message.conversation,
  sender: formatUser(message.sender),
  text: decryptMessage(message),
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const buildConversationPayload = async (conversation, currentUserId) => {
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate("participants", "username profileImage")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profileImage",
      },
    });

  const otherParticipant = populatedConversation.participants.find(
    (participant) => participant._id.toString() !== currentUserId.toString()
  );

  return {
    _id: populatedConversation._id,
    participant: otherParticipant ? formatUser(otherParticipant) : null,
    lastMessage: populatedConversation.lastMessage
      ? formatMessage(populatedConversation.lastMessage)
      : null,
    updatedAt: populatedConversation.updatedAt,
    createdAt: populatedConversation.createdAt,
  };
};

router.use(authMiddleware);

router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    }).sort({ updatedAt: -1 });

    const payload = await Promise.all(
      conversations.map((conversation) => buildConversationPayload(conversation, req.user._id))
    );

    res.status(200).json(payload.filter((conversation) => conversation.participant));
  } catch (error) {
    console.error("Error loading conversations:", error);
    res.status(500).json({ message: "Failed to load conversations" });
  }
});

router.get("/conversations/with/:participantId", async (req, res) => {
  try {
    const { participantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participant" });
    }

    const participant = await User.findById(participantId).select("username profileImage");
    if (!participant) {
      return res.status(404).json({ message: "User not found" });
    }

    let conversation = await getConversationForUsers(req.user._id, participantId);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
      });
    }

    const payload = await buildConversationPayload(conversation, req.user._id);
    res.status(200).json(payload);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
});

router.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation || !isParticipant(conversation, req.user._id)) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .populate("sender", "username profileImage");

    res.status(200).json(messages.map(formatMessage));
  } catch (error) {
    console.error("Error loading messages:", error);
    res.status(500).json({ message: "Failed to load messages" });
  }
});

router.post("/conversations/:participantId/messages", async (req, res) => {
  try {
    const { participantId } = req.params;
    const text = req.body.text?.trim();

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participant" });
    }

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const participant = await User.findById(participantId).select("username profileImage");
    if (!participant) {
      return res.status(404).json({ message: "User not found" });
    }

    let conversation = await getConversationForUsers(req.user._id, participantId);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
      });
    }

    const encrypted = encryptMessage(text);

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      ...encrypted,
    });

    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username profileImage"
    );

    const formattedMessage = formatMessage(populatedMessage);
    const conversationPayload = await buildConversationPayload(conversation, req.user._id);
    const io = getSocketServer();

    if (io) {
      const recipientPayload = await buildConversationPayload(conversation, participantId);
      io.to(`user:${req.user._id.toString()}`).emit("chat:message:new", {
        conversation: conversationPayload,
        message: formattedMessage,
      });
      io.to(`user:${participantId}`).emit("chat:message:new", {
        conversation: recipientPayload,
        message: formattedMessage,
      });
    }

    res.status(201).json({
      conversation: conversationPayload,
      message: formattedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

router.delete("/messages/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId).populate(
      "sender",
      "username profileImage"
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const conversation = await Conversation.findById(message.conversation);
    if (!conversation || !isParticipant(conversation, req.user._id)) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.findByIdAndDelete(message._id);

    const nextLastMessage = await Message.findOne({ conversation: conversation._id })
      .sort({ createdAt: -1 })
      .populate("sender", "username profileImage");

    conversation.lastMessage = nextLastMessage?._id || null;
    conversation.updatedAt = new Date();
    await conversation.save();

    const io = getSocketServer();
    if (io) {
      conversation.participants.forEach((participant) => {
        io.to(`user:${participant.toString()}`).emit("chat:message:deleted", {
          conversationId: conversation._id,
          messageId: message._id,
          lastMessage: nextLastMessage ? formatMessage(nextLastMessage) : null,
        });
      });
    }

    res.status(200).json({
      message: "Message deleted",
      conversationId: conversation._id,
      messageId: message._id,
      lastMessage: nextLastMessage ? formatMessage(nextLastMessage) : null,
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

router.delete("/conversations/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation || !isParticipant(conversation, req.user._id)) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.deleteMany({ conversation: conversation._id });
    await Conversation.findByIdAndDelete(conversation._id);

    const io = getSocketServer();
    if (io) {
      conversation.participants.forEach((participant) => {
        io.to(`user:${participant.toString()}`).emit("chat:conversation:deleted", {
          conversationId: conversation._id,
        });
      });
    }

    res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Failed to delete conversation" });
  }
});

export default router;
