"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
const handleLogin = async (e: any) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/signin`,
      { email, password }
    );

    if (res.status === 200 || res.status === 201) {
      localStorage.setItem("token", res.data.token);
       localStorage.setItem("userId", res.data.userId);
router.push("/");


    }
  } catch (error: any) {
    alert(error.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-blue-500 text-white py-2 rounded-lg">
          Login
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account? <a href="/signup" className="text-blue-500">Sign up</a>
        </p>
      </form>
    </div>
  );
}
