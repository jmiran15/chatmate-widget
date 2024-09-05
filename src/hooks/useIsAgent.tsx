import { useEffect, useState } from "react";
import { type Socket } from "socket.io-client";

type IsAgentEvent = {
  chatId: string;
  isAgent: boolean;
};

// is there an agent for this session - live?
export function useIsAgent({
  chatId,
  socket,
}: {
  chatId: string;
  socket: Socket | undefined;
}) {
  const [isAgent, setIsAgent] = useState(false);
  // const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleIsAgent = (data: IsAgentEvent) => {
      if (chatId === data.chatId) {
        setIsAgent(data.isAgent);
      }
    };

    socket.on("isAgent", handleIsAgent);

    socket.emit("pollingAgent", { chatId });

    return () => {
      socket.off("isAgent", handleIsAgent);
      setIsAgent(false);
    };
  }, [socket, chatId]);

  return { isAgent, setIsAgent };
}
