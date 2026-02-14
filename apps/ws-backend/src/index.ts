import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("A user connected");

  ws.on("message", (data) => {
    const message = data.toString();
    console.log("Broadcasting:", message);

    // ✅ Loop through all connected clients
    wss.clients.forEach((client) => {
      // Send to everyone who is still connected
  // 1. client !== ws: Don't send back to the person who just typed it
      // 2. client.readyState === 1: Only send to people who are still connected
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => console.log("User disconnected"));
});

console.log("Chat server running on ws://localhost:8080");

















// import WebSocket, { WebSocketServer } from "ws";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { JWT_SECRET } from "@repo/backend-common/config";
// import { prismaClient } from "@repo/db/client";

// const wss = new WebSocketServer({ port: 8080 });

// function checkUser(token: string): string | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
//     if (typeof decoded === "string" || !decoded.userId) return null;
//     return decoded.userId as string;
//   } catch {
//     return null;
//   }
// }

// interface Users {
//   ws: WebSocket;
//   userId: string;
//   rooms: string[];
// }
// const users: Users[] = [];

// wss.on("connection", (ws, request) => {
//   const url = request.url;
//   if (!url) {
//     ws.close(1008, "Missing connection URL");
//     return;
//   }

//   const queryParams = new URLSearchParams(url.split("?")[1]);
//   const token = queryParams.get("token") || "";
//   const userId = checkUser(token);

//   if (!userId) {
//     ws.close(1008, "Invalid or missing token");
//     return;
//   }

//   users.push({ ws, userId, rooms: [] });
//   console.log(`✅ User ${userId} connected`);

//   ws.on("message", async (data) => {
//     try {
//       const parsedata = JSON.parse(data.toString());

//       if (parsedata.type === "join") {
//         const user = users.find((u) => u.ws === ws);
//         if (user && !user.rooms.includes(parsedata.roomId)) {
//           user.rooms.push(parsedata.roomId);
//         }
//         console.log(`User ${userId} joined room ${parsedata.roomId}`);
//       }

//       if (parsedata.type === "leave") {
//         const user = users.find((u) => u.ws === ws);
//         if (!user) return;
//         user.rooms = user.rooms.filter((r) => r !== parsedata.roomId);
//         console.log(`User ${userId} left room ${parsedata.roomId}`);
//       }

//       if (parsedata.type === "chat") {
//         const roomSlug = parsedata.roomId;
//         const message = parsedata.message;
//         const uid = Number(userId);

//         const room = await prismaClient.room.findUnique({
//           where: { slug: roomSlug },
//         });
//         if (!room) {
//           console.error("Room not found:", roomSlug);
//           return;
//         }

//         await prismaClient.chat.create({
//           data: {
//             roomId: room.id,
//             message,
//             userId: uid,
//           },
//         });

//         // Broadcast message
//         users.forEach((user) => {
//           if (user.rooms.includes(roomSlug)) {
//             user.ws.send(
//               JSON.stringify({
//                 type: "chat",
//                 userId,
//                 roomId: roomSlug,
//                 message,
//               })
//             );
//           }
//         });
//       }
//     } catch (err) {
//       console.error("Error handling message:", err);
//     }
//   });

//   ws.on("close", () => {
//     const index = users.findIndex((u) => u.ws === ws);
//     if (index !== -1) users.splice(index, 1);
//     console.log(`❌ User ${userId} disconnected`);
//   });
// });

// console.log("✅ WebSocket server running on port 8080");
