import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

const prisma =prismaClient;

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, type, memberIds = [] } = req.body;

    // @ts-ignore
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔍 1. Check if room already exists
    const existingRoom = await prisma.room.findFirst({
      where: {
        name: name,
        type: type, // optional but recommended
      },
    });

    if (existingRoom) {
      return res.status(409).json({
        message: "Room already exists",
        room: existingRoom,
      });
    }

    // ✅ 2. Create room if not exists
    const room = await prisma.room.create({
      data: {
        name,
        type,
        createdBy: userId,
        members: {
          create: [
            {
              userId,
              role: "ADMIN",
            },
            ...memberIds.map((id: string) => ({
              userId: id,
              role: "MEMBER",
            })),
          ],
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(201).json(room);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create room" });
  }
};

export const getOldMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        roomId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50, // last 50 messages
    });

    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const loadRoomAndMessagesById = async (
  req: Request,
  res: Response
) => {
  try {
    // 1️⃣ Get roomId from URL params instead of body
    const { roomId } = req.params;

    // @ts-ignore
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2️⃣ Find room where user is a MEMBER and ID matches
    const room = await prisma.room.findFirst({
      where: {
        id: roomId, // Filter by ID
        members: {
          some: {
            userId: userId,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found or you are not a member",
      });
    }

    // 3️⃣ Get old messages for that room
    const messages = await prisma.message.findMany({
      where: {
        roomId: room.id,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
        type: true,
      },
    });

    return res.status(200).json({
      room,
      messages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load room chat" });
  }
};
export const joinRoomByName = async (req: Request, res: Response) => {
  try {
    const { roomName } = req.body;

    // @ts-ignore
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ Find room by name
    const room = await prisma.room.findFirst({
      where: {
        name: roomName,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2️⃣ Check if user already joined
    const existingMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        message: "Already a member of this room",
        room,
      });
    }

    // 3️⃣ Add user to room
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: userId,
        role: "MEMBER",
      },
    });

    return res.status(200).json({
      message: "Joined room successfully",
      room: {
        id: room.id,
        name: room.name,
        type: room.type,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to join room" });
  }
};
export const enterRoomAndLoadChat = async (req: Request, res: Response) => {
  try {
   const { roomName } = req.body;

    // @ts-ignore
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ Find room by name
    const room = await prisma.room.findFirst({
      where: {
        name: roomName,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2️⃣ Check membership
    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    // 3️⃣ Load old messages
    const messages = await prisma.message.findMany({
      where: {
        roomId: room.id,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
        type: true,
      },
    });

    return res.status(200).json({
      room: {
        id: room.id,
        name: room.name,
        type: room.type,
        role: member.role,
      },
      messages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to enter room" });
  }
};
export const getUserRooms = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId; // Use the authenticated user's ID
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            // Optional: isActive: true (if you have a soft-delete/leave mechanism)
          },
        },
      },
      include: {
        _count: {
          select: { members: true } // Useful to show how many people are in the room
        },
      },
      orderBy: {
        createdAt: "desc", // Show recently joined/created rooms first
      },
    });

    return res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch your rooms" });
  }
};