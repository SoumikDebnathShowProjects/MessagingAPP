import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { cloudinary } from "../config/cloudinary";

// ==========================
// GET Avatar
// ==========================
export const getAvatarURL = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ avatar: user.avatar });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================
// SET Avatar
// ==========================
export const setAvatarURL = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    console.log(req.file);

    const avatarUrl = (req.file as any).path;

    const user = await prismaClient.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return res.status(200).json({
      message: "Avatar set successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================
// UPDATE Avatar
// ==========================
export const updateAvatarURL = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const avatarUrl = (req.file as any).path;

    // get existing avatar
    const existingUser = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // delete old image from Cloudinary
    if (existingUser?.avatar) {
      const publicId = existingUser.avatar
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      //@ts-ignore
      await cloudinary.uploader.destroy(publicId);
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return res.status(200).json({
      message: "Avatar updated successfully",
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================
// DELETE Avatar
// ==========================
//ts-ignore
export const deleteAvatarURL = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (user?.avatar) {
      const publicId = user.avatar
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      //@ts-ignore
      await cloudinary.uploader.destroy(publicId);
    }

    await prismaClient.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    return res.status(200).json({
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
