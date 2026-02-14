"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatHeader from "../components/ChatHeader";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/joinRoomModal";
// import Cloudinary from "../components/cloudinary";

export default function HomePage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ChatHeader roomname={"Dashboard"} />

      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 w-72">
          
          <button 
            onClick={() => router.push("/room")} // Or however you view your list
            className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition shadow-sm"
          >
            My Rooms
          </button>

          <button 
            onClick={() => setJoinOpen(true)}
            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            + Join
          </button>

          <button 
            onClick={() => setCreateOpen(true)}
            className="w-full bg-emerald-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-emerald-700 transition shadow-lg"
          >
            + Create Room
          </button>
        </div>
      </div>

      {/* Modals placed at the bottom */}
      <CreateRoomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <JoinRoomModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
      />
      <img src="https://res.cloudinary.com/dsgptwqsu/image/upload/v1771016679/Profile/avatar_1771016675317.png" width="200" />

      {/* <Cloudinary/> */}
    </div>
  );
}