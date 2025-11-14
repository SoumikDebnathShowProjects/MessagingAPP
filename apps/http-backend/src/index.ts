import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import {roomSchema, signinSchema, UserSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());
app.post('/signup', (req, res) => {
  const data= UserSchema.safeParse(req.body);
    try{
    if(data.success){
        const {email, password, name}=data.data;
        prismaClient.user.create({
            data:{
                email,
                password,
                name,
            }
        }).then((user)=>{
            res.json({userId: user.id, name: user.name});
        }).catch((err)=>{
            res.status(500).json({error: 'Database error'});
        });
       ;
    }else{
         return res.status(400).json({error: 'Invalid data'});
    }
    }catch(err){
        
        console.log(err);
        
    }
    
});
app.post("/signin", async (req, res) => {
  const parseData = signinSchema.safeParse(req.body);

  if (!parseData.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { username, password } = parseData.data;

  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: username, // assuming username is actually the email
        password: password,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    // optional but useful for debugging
    console.log("Generated Token:", token);
    console.log("JWT_SECRET used:", JWT_SECRET);

    // return only the token to client — never send secret key!
    res.json({ token });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = roomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Incorrect inputs",
      error: parsedData.error.format(),
    });
  }

  // `req.userId` is set by middleware (from JWT)
  // @ts-ignore
  const userId = Number(req.userId);

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      message: "Room created successfully",
      roomId: room.id,
      slug: room.slug,
    });
  } catch (e: any) {
    console.error("Room creation error:", e);
    res.status(409).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chats/:room", middleware, async (req, res) => {
  const { room } = req.params;

  if (!room) {
    return res.status(400).json({ message: "Room parameter missing" });
  }

  const decodedRoom = decodeURIComponent(room);

  try {
    const foundRoom = await prismaClient.room.findUnique({
      where: { slug: decodedRoom }, // change to { name: decodedRoom } if needed
    });

    if (!foundRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const chats = await prismaClient.chat.findMany({
      where: { roomId: foundRoom.id },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { id: "desc" },
      take: 50,
    });

    res.json(chats.reverse());
  } catch (err: any) {
    console.error("❌ Error fetching chats:", err.message || err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});






app.listen(3001, () => {
    console.log('Server running on port 3001');
});