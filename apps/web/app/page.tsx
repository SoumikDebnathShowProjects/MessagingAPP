"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./page.module.css";


const HTTP_URL = "http://localhost:3001"; 
const WS_URL = "ws://localhost:8080";  

interface ChatMessage {
  type: string;
  userId: string;
  roomId: string;
  message: string;
}

export default function Home() {
  const [token, setToken] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const wsRef = useRef<WebSocket | null>(null); 

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect WebSocket after login
  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onclose = () => console.log("🔴 Disconnected from WS");
    ws.onopen = () => console.log("🟢 Connected to WS");

    return () => ws.close();
  }, [token]);

  // Login
  async function handleLogin(e: any) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post(`${HTTP_URL}/signin`, {
        username,
        password,
      });

      if (res.data.token) {
        setToken(res.data.token);
        alert("✅ Login successful!");
      } else {
        alert(res.data.error || "Login failed");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Server error during login");
    }
  }

  // Create Room
  async function handleCreateRoom(e: any) {
    e.preventDefault();
    const name = e.target.roomname.value;

    try {
      const res = await axios.post(
        `${HTTP_URL}/room`,
        { name },
        { headers: { Authorization:token } }
      );

      if (res.data.roomId) {
        setRoomId(res.data.slug);
        alert(`✅ Room created: ${res.data.slug}`);
      } else {
        alert(res.data.message || "Error creating room");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Server error while creating room");
    }
  }

  // Join Room and Load Old Messages
async function handleJoinRoom(e: any) {
  e.preventDefault();
  const id = e.target.roomid.value;

  setRoomId(id);
  wsRef.current?.send(JSON.stringify({ type: "join", roomId: id }));
  alert(`✅ Joined room: ${id}`);

  // ✅ Fetch previous 50 chats (encode to fix space issue)
  try {
    const encodedId = encodeURIComponent(id);
  const res = await axios.get(`${HTTP_URL}/chats/${encodedId}`, {
  headers: {
    Authorization:token,
  },
});

    setMessages(res.data || []);
  } catch (err: any) {
    console.error("Error loading chats:", err.response?.data || err.message);
    alert("Could not load previous messages.");
  }
}


  // Send Chat Message
  function handleChat(e: any) {
    e.preventDefault();
    if (!message.trim()) return;
    wsRef.current?.send(JSON.stringify({ type: "chat", roomId, message }));
    setMessage("");
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>💬 My Chat App</h1>

      {!token && (
        <div className={styles.loginContainer}>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" placeholder="Enter username" required />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter password" required />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {token && (
        <>
          <div className={styles.createRoom}>
            <h1>Create Room</h1>
            <form onSubmit={handleCreateRoom}>
              <label htmlFor="roomname">Room Name</label>
              <input type="text" id="roomname" name="roomname" placeholder="Enter room name" required />
              <button type="submit">Create</button>
            </form>
          </div>

          <div className={styles.joinRoom}>
            <h1>Join Room</h1>
            <form onSubmit={handleJoinRoom}>
              <label htmlFor="roomid">Room ID</label>
              <input type="text" id="roomid" name="roomid" placeholder="Enter room ID" required />
              <button type="submit">Join</button>
            </form>
          </div>

          <div className={styles.chatRoom}>
            <h1>Chat Room</h1>
            <p><strong>Room ID:</strong> {roomId || "Not joined yet"}</p>

            <div className={styles.chatBox}>
              {messages.length === 0 && <p className={styles.noMessages}>No messages yet...</p>}
              {messages.map((msg, i) => (
                <p key={i} className={msg.userId == userId ? styles.myMessage : styles.otherMessage}>
                  <b>{msg.userId}</b>: {msg.message}
                </p>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            <form onSubmit={handleChat}>
              <label htmlFor="message">Message</label>
              <input
                type="text"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                required
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
