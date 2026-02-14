"use client";

import { useState } from "react";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateRoomModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("GROUP");

  if (!open) return null;

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/createrooms`,
      { name, type },
      {
        headers: {
          authorization: token,
        },
      }
    );

    // ✅
    console.log("Room created:", res.data);

    setName("");
    setType("GROUP");
    onClose();
  } catch (err: any) {
    if (err.response?.status === 409) {
      alert(`Room already exists`);
    } else {
      alert(`Failed to create room`);
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
          <h2 className="text-lg font-semibold">Create Room</h2>

          <input
            type="text"
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border p-2 w-full"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="PRIVATE">Private</option>
            <option value="GROUP">Group</option>
            <option value="PUBLIC">Public</option>
          </select>

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
              className="bg-blue-600 text-white px-4 py-1 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
