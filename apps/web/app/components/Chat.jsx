"use client";
import { useEffect, useState } from "react";

export default function ChatLayout() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // Store all chat messages
  const [input, setInput] = useState("");

  useEffect(() => {
    // 1. Connect to your basic server
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("Connected to WS Server");

    // 2. Listen for messages from the server
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    setSocket(ws);

    return () => ws.close(); // Cleanup
  }, []);

  const sendMessage = () => {
    if (socket && input) {
      socket.send(input); // 3. Send message to server
      setInput(""); // Clear input
    }
  };

  return (
    <div className="p-10">
      <div className="h-64 border overflow-y-auto mb-4 p-2 bg-white">
        {messages.map((msg, i) => (
          <div key={i} className="border-b py-1">{msg}</div>
        ))}
      </div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 mr-2"
        placeholder="Type a message..."
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2">
        Send
      </button>
    </div>
  );
}