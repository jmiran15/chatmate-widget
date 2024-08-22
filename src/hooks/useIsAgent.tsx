import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket";

type IsAgentEvent = {
  sessionId: string;
  isAgent: boolean;
};

// is there an agent for this session - live?
export function useIsAgent({ sessionId }: { sessionId: string }) {
  const [isAgent, setIsAgent] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleIsAgent = (data: IsAgentEvent) => {
      if (sessionId === data.sessionId) {
        setIsAgent(data.isAgent);
      }
    };

    socket.on("isAgent", handleIsAgent);

    socket.emit("pollingAgent", { sessionId });

    return () => {
      socket.off("isAgent", handleIsAgent);
      setIsAgent(false);
    };
  }, [socket, sessionId]);

  return { isAgent, setIsAgent };
}
