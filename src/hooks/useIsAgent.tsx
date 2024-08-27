import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket";

type IsAgentEvent = {
  chatId: string;
  isAgent: boolean;
};

// is there an agent for this session - live?
export function useIsAgent({ chatId }: { chatId: string }) {
  const [isAgent, setIsAgent] = useState(false);
  const socket = useSocket();

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
