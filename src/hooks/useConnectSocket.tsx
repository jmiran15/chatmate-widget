import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_PATH } from "../utils/constants";

export function useConnectSocket() {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const socket = io(API_PATH);
    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  return socket;
}
