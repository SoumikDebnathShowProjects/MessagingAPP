import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
export const syncBulkMessages = async (req: Request, res: Response) => {
  try {
    const { roomId, messages } = req.body; // 'messages' is an array from the frontend
    // @ts-ignore
    const userId = req.userId;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "No messages to sync" });
    }

    // Use createMany for high performance
    const result = await prismaClient.message.createMany({
      data: messages.map((msg: any) => ({
        content: msg.content,
        type: msg.type || "TEXT",
        roomId: roomId,
        senderId: userId, // Assuming the current user is the sender for the buffered batch
        createdAt: new Date(msg.createdAt) // Preserve the time they were actually sent
      })),
      skipDuplicates: true, // Safety check
    });

    return res.status(201).json({ 
      message: `Successfully synced ${result.count} messages`,
      count: result.count 
    });
  } catch (err) {
    console.error("Bulk sync error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};