import axios from "axios";
import { useEffect, useState } from "react";

export default function Avatar({ userId }) {
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const fetchAvatar = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:3001/avatar/${userId}`,
        {
          headers: {
            token: token,
          },
        }
      );

      setAvatar(res.data.avatar);
    };

    fetchAvatar();
  }, [userId]);

  return (
    <>
      {avatar && <img src={avatar} width={150} />}
    </>
  );
}
