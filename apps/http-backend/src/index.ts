import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import {roomSchema, signinSchema, UserSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';
import cors from 'cors';
import { createRoom, enterRoomAndLoadChat, getOldMessages, getUserRooms, joinRoomByName, loadRoomAndMessagesById} from './controllers/CreateRoom';
import {  syncBulkMessages } from './controllers/Message';
import { deleteAvatarURL, getAvatarURL, setAvatarURL, updateAvatarURL } from './controllers/avaterurl';
import upload from './config/cloudinary';   // adjust path if needed

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
        }).then((user:any)=>{
            res.json({userId: user.id, name: user.name});
        }).catch((err:any)=>{
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

  const { email, password } = parseData.data;

  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: email, // assuming username is actually the email
        password: password,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId:user.id });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/me",middleware, async (req, res) => {
//@ts-ignore
    const userId=req.userId;
    return res.status(200).json({
    userId
    
  });
  

});
//////////////////////////////////////////////////////////////////
app.post("/createrooms",middleware,createRoom);
app.get("/messages/:roomId", middleware, getOldMessages);
app.get("/load/:roomId", middleware, loadRoomAndMessagesById);
app.post("/room/join",middleware,joinRoomByName);
app.post("/room/enter", middleware, enterRoomAndLoadChat);
app.get("/room/my-rooms", middleware, getUserRooms);
app.post("/room/message/bulk", middleware, syncBulkMessages);
///////////////////////////////////////

app.get("/avatar/:userId",middleware, getAvatarURL);
app.post("/avatar", middleware, upload.single("avatar"), setAvatarURL);
app.put("/avatar", middleware, upload.single("avatar"), updateAvatarURL);


app.delete("/avatar",middleware, deleteAvatarURL);


app.listen(3001, () => {
    console.log('Server running on port 3001');
});