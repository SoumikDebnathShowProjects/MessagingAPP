"use client";
import { useEffect, useRef } from "react";

export default function Messages({ messages, currentUserId }) {
  // 1. Create a reference to the bottom of the list
  const messagesEndRef = useRef(null);

  // 2. Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Trigger scroll every time the 'messages' array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!messages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400 font-medium">
        Select a room to view messages
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col">
      {/* 4. Use 'mt-auto' on a wrapper to push content to bottom like WhatsApp */}
      <div className="mt-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">No messages yet. Say hi!</div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId || m.senderId === "me";

            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-md ${
                  isMe ? "bg-blue-600 text-white" : "bg-white border text-gray-800"
                }`}>
                  <p className="break-words">{m.content}</p>
                  <p className={`text-[10px] mt-1 opacity-70 ${isMe ? "text-right" : "text-left"}`}>
                    {m.createdAt && new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* 5. This invisible div acts as an anchor for the scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
}