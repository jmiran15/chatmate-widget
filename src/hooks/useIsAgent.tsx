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

  console.log("socket from hoo: ", socket);

  useEffect(() => {
    console.log("in the usee");
    if (!socket) return;

    const handleIsAgent = (data: IsAgentEvent) => {
      if (sessionId === data.sessionId) {
        setIsAgent(data.isAgent);
      }
    };

    socket.on("isAgent", handleIsAgent);

    console.log("emiting ");
    socket.emit("pollingAgent", { sessionId });

    return () => {
      socket.off("isAgent", handleIsAgent);
      setIsAgent(false);
    };
  }, [socket, sessionId]);

  console.log("isAgent from useIsAgent: ", isAgent);

  return { isAgent, setIsAgent };
}
