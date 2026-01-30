"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";

const HTTP_URL = "http://localhost:3001";
const WS_URL = "ws://localhost:8080";

interface ChatMessage {
  message: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function Home() {
  const [token, setToken] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSignup, setIsSignup] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket connect after login
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => ws.close();
  }, [token]);

  // SIGNUP
  async function handleSignup(e: any) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await axios.post(`${HTTP_URL}/signup`, {
        name,
        email,
        password,
      });
      alert("✅ Signup successful. Please login.");
      setIsSignup(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Signup failed");
    }
  }

  // LOGIN
  async function handleLogin(e: any) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post(`${HTTP_URL}/signin`, {
        email,
        password,
      });
      setToken(res.data.token);
      alert("✅ Login successful");
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
  }

  // CREATE ROOM
  async function handleCreateRoom(e: any) {
    e.preventDefault();
    const name = e.target.roomname.value;

    try {
      const res = await axios.post(
        `${HTTP_URL}/room`,
        { name },
        { headers: { Authorization: token } }
      );
      setRoomId(res.data.slug);
      alert(`✅ Room created: ${res.data.slug}`);
    } catch {
      alert("Room already exists");
    }
  }

  // JOIN ROOM + LOAD CHATS
  async function handleJoinRoom(e: any) {
    e.preventDefault();
    const id = e.target.roomid.value;
    setRoomId(id);

    wsRef.current?.send(JSON.stringify({ type: "join", roomId: id }));

    try {
      const res = await axios.get(
        `${HTTP_URL}/chats/${encodeURIComponent(id)}`,
        { headers: { Authorization: token } }
      );
      setMessages(res.data);
    } catch {
      alert("Failed to load chats");
    }
  }

  // SEND MESSAGE
  function handleChat(e: any) {
    e.preventDefault();
    if (!message.trim()) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        roomId,
        message,
      })
    );
    setMessage("");
  }

  return (
    <div className={styles.container}>
      <h1>💬 Chat App</h1>

      {!token && (
        <div>
          <h2>{isSignup ? "Sign Up" : "Login"}</h2>

          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {isSignup && (
              <input name="name" placeholder="Name" required />
            )}
            <input name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button>{isSignup ? "Sign Up" : "Login"}</button>
          </form>

          <p onClick={() => setIsSignup(!isSignup)} style={{ cursor: "pointer" }}>
            {isSignup
              ? "Already have an account? Login"
              : "New user? Sign up"}
          </p>
        </div>
      )}

      {token && (
        <>
          <form onSubmit={handleCreateRoom}>
            <input name="roomname" placeholder="Room name" required />
            <button>Create Room</button>
          </form>

          <form onSubmit={handleJoinRoom}>
            <input name="roomid" placeholder="Room ID" required />
            <button>Join Room</button>
          </form>

          <h3>Room: {roomId || "Not joined"}</h3>

          <div className={styles.chatBox}>
            {messages.map((m, i) => (
              <p key={i}>
                <b>{m.user?.name || "Unknown"}:</b> {m.message}
              </p>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChat}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message"
              required
            />
            <button>Send</button>
          </form>
        </>
      )}
    </div>
  );
}
