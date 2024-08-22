import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_PATH } from "../utils/constants";

export function useConnectSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      const newSocket = io(API_PATH);
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [socket]);

  return socket;
}
