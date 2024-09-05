import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Chatbot } from "../utils/types";

interface ProviderProps {
  chatbot: Chatbot | undefined;
  children: ReactNode;
}

const context = createContext<Chatbot | undefined>(undefined);

export function useChatbot() {
  return useContext(context);
}

export function ChatbotProvider({ chatbot, children }: ProviderProps) {
  return <context.Provider value={chatbot}>{children}</context.Provider>;
}
