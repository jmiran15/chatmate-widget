import React, { createContext, useContext } from "react";
import { RenderableMessage } from "../hooks/useSession";

interface SessionContextType {
  sessionId: string;
  loading: boolean;
  messages: RenderableMessage[];
  setMessages: React.Dispatch<React.SetStateAction<RenderableMessage[]>>;
  pendingCount: number;
  setPendingCount: React.Dispatch<React.SetStateAction<number>>;
  resetSession: () => Promise<boolean>;
  streamChat: (params: { message: string }) => Promise<void>;
  followUps: string[];
  setFollowUps: React.Dispatch<React.SetStateAction<string[]>>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}

export function SessionProvider({
  props,
  children,
}: {
  props: SessionContextType;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={props}>{children}</SessionContext.Provider>
  );
}
