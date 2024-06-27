export interface Chatbot {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  publicName: string;
  logoUrl: string;
  themeColor: string;
  introMessages: string[];
  openIcon: string;
  starterQuestions: string[];
  name: string;
  systemPrompt: string;
  model: string;
  responseLength: string;
}

export interface Message {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  role: string;
  content: string | null;
  chatId?: string;
}

export interface ChatResult {
  uuid: string;
  type: "textResponseChunk" | "textResponse" | "abort";
  textResponse: string | null;
  sources: string[];
  error: string | null;
  close: boolean;
}
