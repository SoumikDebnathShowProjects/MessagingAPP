"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Sidebar({ passId,activeRoomId}) {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRooms = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/room/my-rooms`,
          {
            headers: { authorization: token },
          }
        );
        // The response is an array of room objects
        setRooms(res.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRooms();
  }, []);

  return (
    <div className="w-64 h-screen border-r bg-white flex flex-col shrink-0">
      <div className="p-5 border-b font-bold text-gray-800 flex justify-between items-center">
        <span>Rooms</span>
        {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!loading && rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => passId(room.id)}
            className={`w-full text-left p-4 border-b transition-colors ${
              activeRoomId === room.id 
                ? "bg-blue-50 border-r-4 border-r-blue-500" 
                : "hover:bg-gray-100"
            }`}
          >
            {/* Room Name */}
            <div className="font-semibold text-gray-700 capitalize">
              {room.name}
            </div>

            <div className="flex justify-between items-center mt-2">
              {/* Room Type */}
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                {room.type}
              </span>

              {/* Member Count from _count.members */}
              <span className="text-[10px] text-gray-500 font-medium">
                {room._count?.members || 0} {room._count?.members === 1 ? 'Member' : 'Members'}
              </span>
            </div>
          </button>
        ))}

        {!loading && rooms.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm italic">
            No rooms joined yet.
          </div>
        )}
      </div>
    </div>
  );
}