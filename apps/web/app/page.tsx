"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import ChatLayout from "./components/ChatLayout"
import Chat from "./components/Chat"
import HomePage from "./Home/page";


export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/me`,
          {
            headers: {
              authorization: token,
            },
          }
        );

        if (res.status === 200) {
          setLoggedIn(true);
        }
      } catch {
        setLoggedIn(false);
        router.push("/login");
      }
    };

    checkLogin();
  }, [router]);

  return <>{loggedIn &&<HomePage/>}</>;
}
