"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function JoinRoomModal({ open, onClose }: Props) {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/room/join`,
        { roomName },
        {
          headers: {
            authorization: token,
          },
        }
      );

      setRoomName("");
      onClose();

      // 🔹 navigate to chat page
      router.push(`/room`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        alert("Room not found or you are not a member");
      } else {
        alert("Failed to join room");
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="bg-white p-6 rounded-lg w-[350px] space-y-4"
        >
          <h2 className="text-lg font-semibold">Join Room</h2>

          <input
            type="text"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            className="border p-2 w-full"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-1 rounded"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
