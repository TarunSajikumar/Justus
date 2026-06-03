import { Response } from "express";
import User from "../models/User";
import Message from "../models/Message";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * GET /api/messages/:partnerId
 * Returns paginated chat history between the current user and their partner.
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { partnerId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const before = req.query.before as string | undefined;

  if (!partnerId) {
    return res.status(400).json({ message: "partnerId is required" });
  }

  try {
    let query: any = {
      $or: [
        { sender_id: userId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: userId },
      ],
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    // Mark messages from partner as read
    await Message.updateMany(
      { sender_id: partnerId, receiver_id: userId, read: false },
      { read: true }
    );

    return res.json({
      messages: messages.reverse().map((m: any) => ({
        id: m._id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        message: m.message,
        read: m.read,
        status: m.status || 'sent',
        media_url: m.media_url || null,
        media_type: m.media_type || null,
        reaction: m.reaction || null,
        reply_to: m.reply_to || null,
        created_at: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/**
 * POST /api/messages
 * Persists a new text message to the database.
 * Body: { partnerId, message, reply_to? }
 */
export const createMessage = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { partnerId, message, reply_to } = req.body;

  if (!partnerId || !message?.trim()) {
    return res.status(400).json({ message: "partnerId and message are required" });
  }

  try {
    const newMessage = await Message.create({
      sender_id: userId,
      receiver_id: partnerId,
      message: message.trim(),
      reply_to: reply_to || null,
      status: 'sent',
    });

    return res.status(201).json({
      message: {
        id: newMessage._id,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        message: newMessage.message,
        read: newMessage.read,
        status: 'sent',
        reply_to: newMessage.reply_to || null,
        created_at: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("createMessage error:", error);
    return res.status(500).json({ message: "Failed to save message" });
  }
};

/**
 * PATCH /api/messages/:partnerId/read
 * Marks all messages from the partner as read.
 */
export const markMessagesRead = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { partnerId } = req.params;

  try {
    await Message.updateMany(
      { sender_id: partnerId, receiver_id: userId, read: false },
      { $set: { read: true, status: 'read' } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("markMessagesRead error:", error);
    return res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

/**
 * DELETE /api/messages/:messageId
 * Delete a message (only by sender).
 */
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { messageId } = req.params;

  try {
    const message = await Message.findOne({ _id: messageId, sender_id: userId });
    if (!message) {
      return res.status(404).json({ message: "Message not found or not authorized" });
    }

    await Message.deleteOne({ _id: messageId });
    return res.json({ success: true });
  } catch (error) {
    console.error("deleteMessage error:", error);
    return res.status(500).json({ message: "Failed to delete message" });
  }
};

/**
 * GET /api/messages/search
 * Search messages by query text.
 * Query params: partnerId, q
 */
export const searchMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { partnerId, q } = req.query as { partnerId: string; q: string };

  if (!partnerId || !q?.trim()) {
    return res.status(400).json({ message: "partnerId and q are required" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: userId },
      ],
      message: { $regex: q.trim(), $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({
      messages: messages.map((m: any) => ({
        id: m._id,
        sender_id: m.sender_id,
        message: m.message,
        read: m.read,
        created_at: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("searchMessages error:", error);
    return res.status(500).json({ message: "Failed to search messages" });
  }
};

/**
 * POST /api/messages/:messageId/reaction
 * Add or toggle an emoji reaction on a message.
 * Body: { reaction }
 */
export const addReaction = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { messageId } = req.params;
  const { reaction } = req.body;

  if (!reaction) {
    return res.status(400).json({ message: "reaction is required" });
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Toggle: if same reaction, remove; otherwise set new
    const newReaction = (message as any).reaction === reaction ? null : reaction;
    (message as any).reaction = newReaction;
    await message.save();

    return res.json({ success: true, reaction: newReaction });
  } catch (error) {
    console.error("addReaction error:", error);
    return res.status(500).json({ message: "Failed to add reaction" });
  }
};
