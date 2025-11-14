import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name can't exceed 100 characters" }),
});

export const signinSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }).max(30),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});


export const roomSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Room name must be at least 3 characters long" })
    .max(50, { message: "Room name cannot exceed 50 characters" }),
});
