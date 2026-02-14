"use client";
import { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSend }) {
  const [value, setValue] = useState("");

  const send = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="bg-white border-t p-4 flex gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
        className="flex-1 bg-gray-100 rounded-lg px-4 py-2"
        placeholder="Type a message..."
      />
      <button onClick={send} className="bg-blue-500 text-white p-3 rounded-lg">
        <Send />
      </button>
    </div>
  );
}
