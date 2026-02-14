"use client";

import { LogOut, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatHeader({ roomname }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-600 hover:text-black transition"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Room Name */}
      <h2 className="font-bold text-gray-800">{roomname}</h2>

      {/* Logout */}
      <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition">
        <LogOut size={20} />
      </button>
    </div>
  );
}