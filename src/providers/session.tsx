import React, { createContext, useContext } from "react";
import { Message } from "src/utils/types";

interface SessionContextType {
  sessionId: string;
  loading: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  pendingCount: number;
  setPendingCount: React.Dispatch<React.SetStateAction<number>>;
  resetSession: () => Promise<boolean>;
  streamChat: (params: { message: string }) => Promise<void>;
  followUps: string[];
  setFollowUps: React.Dispatch<React.SetStateAction<string[]>>;
  chat: any | null;
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
