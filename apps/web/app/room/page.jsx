"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ChatHeader from "../components/ChatHeader";
import Sidebar from "../components/Sidebar";
import Messages from "../components/Messages";
import MessageInput from "../components/MessageInput";

export default function ChatLayout() {
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState(null);
  const [roomName, setRoomName] = useState("Dashboard");
  const [socket, setSocket] = useState(null);

  // 1. Refs for background logic
  const pendingMessages = useRef([]);
  const currentRoomId = useRef(null);

  // 2. The Sync Function (Centralized)
  const syncMessagesToBackend = async (id, msgs) => {
    if (!id || msgs.length === 0) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(`http://localhost:3001/room/message/bulk`, {
        roomId: id,
        messages: msgs
      }, {
        headers: { authorization: token }
      });
      console.log("Buffered messages successfully synced to DB");
    } catch (err) {
      console.error("Failed to sync history to backend", err);
    }
  };

  const handleRoomSelection = (id) => {
    // If user switches rooms, sync old room data first
    if (roomId && pendingMessages.current.length > 0) {
      syncMessagesToBackend(roomId, pendingMessages.current);
      pendingMessages.current = [];
    }
    setRoomId(id);
    currentRoomId.current = id;
  };

  // 3. WebSocket Connection + Close Logic
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket Server");
    };

    ws.onmessage = (event) => {
      const newMessage = {
        id: Math.random().toString(),
        content: event.data,
        senderId: "other",
        createdAt: new Date().toISOString()
      };
      
      setMessages((prev) => [...(prev || []), newMessage]);
      
      pendingMessages.current.push({
        content: newMessage.content,
        senderId: "other",
        createdAt: newMessage.createdAt
      });
    };

    // ✅ Sync when user disconnects from WebSocket (Network loss/Server close)
    ws.onclose = () => {
      console.log("WebSocket Closed. Triggering Sync...");
      if (currentRoomId.current && pendingMessages.current.length > 0) {
        syncMessagesToBackend(currentRoomId.current, pendingMessages.current);
        pendingMessages.current = []; // Clear to avoid double sync in cleanup
      }
    };

    setSocket(ws);

    return () => {
      // ✅ Sync when component unmounts (React navigation)
      if (currentRoomId.current && pendingMessages.current.length > 0) {
        syncMessagesToBackend(currentRoomId.current, pendingMessages.current);
        pendingMessages.current = [];
      }
      ws.close();
    };
  }, []);

  // 4. Emergency Sync (Browser Tab/Window Close)
  useEffect(() => {
    const handleTabClose = (e) => {
      if (currentRoomId.current && pendingMessages.current.length > 0) {
        // We use a simplified sync here because the browser may kill axios
        syncMessagesToBackend(currentRoomId.current, pendingMessages.current);
      }
    };

    window.addEventListener("beforeunload", handleTabClose);
    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, []);

  // 5. Load History
  useEffect(() => {
    if (!roomId) return;

    const fetchChat = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:3001/load/${roomId}`, {
          headers: { authorization: token }
        });
        
        setMessages(res.data.messages);
        setRoomName(res.data.room.name);
      } catch (err) {
        console.error("Failed to load chat", err);
        setMessages([]); 
      }
    };
    fetchChat();
  }, [roomId]);

  // 6. Send Message
  const sendMessage = (text) => {
    if (!text.trim()) return;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(text);
    }

    const myNewMessage = {
      id: Math.random().toString(),
      content: text,
      senderId: "me",
      createdAt: new Date().toISOString()
    };
    
    setMessages((prev) => [...(prev || []), myNewMessage]);

    pendingMessages.current.push({
      content: myNewMessage.content,
      senderId: "me",
      createdAt: myNewMessage.createdAt
    });
  };
  const [myId, setMyId] = useState(null);

useEffect(() => {
  const initializeUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/me`,
        { headers: { authorization: token } }
      );
      setMyId(res.data.userId);
      
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
};

  initializeUser();
}, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
     

         <Sidebar passId={handleRoomSelection} activeRoomId={roomId}/>
        <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader roomname={roomName} />
        <Messages messages={messages} currentUserId={myId}/>
        {roomId && <MessageInput onSend={sendMessage} />}
      </div>
    </div>
  );
}

