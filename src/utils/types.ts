// this is the type for the chatbot object in the api.chatmate
export interface Chatbot {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  userId: string;
  publicName: string;
  introMessages: string[];
  model?: string;
  responseLength?: string;
  systemPrompt?: string;
  openIcon: string;
  themeColor: string;
  starterQuestions: string[];
  croppedLogoFilepath?: string;
  lastCrop?: string;
  originalLogoFilepath?: string;
  containerRadius?: String;
  openButtonText?: String;
  widgetRestrictedUrls: String[];
  embeddedOn?: string;
  installed: boolean;
  lastPingedAt?: string;
  widgetPosition?: "BOTTOM_RIGHT" | "BOTTOM_LEFT";
}

enum ActivityType {
  REQUESTED_LIVE_CHAT = "REQUESTED_LIVE_CHAT",
  AGENT_JOINED = "AGENT_JOINED",
  AGENT_LEFT = "AGENT_LEFT",
}

// this is supposed to be the message type in in api.chatmate
interface PrismaMessage {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  content: string;
  chatId: string;
  seenByUser?: boolean;
  seenByAgent?: boolean;
  seenByUserAt?: Date;
  activity?: ActivityType;
}

type TypingState = "typing" | "typed";

interface TypingInformation {
  isPreview?: boolean;
  isTyping?: boolean;
  typingState?: TypingState;
  typedContents?: string;
}

interface StreamingInformation {
  streaming?: boolean;
  loading?: boolean;
  error: string | null;
}
export interface Message
  extends PrismaMessage,
    TypingInformation,
    StreamingInformation {}

// this is the SSE type in api.chatmate
export interface SSEMessage {
  id: string;
  type: "textResponseChunk" | "abort";
  textResponse: string | null;
  error: string | null;
  streaming: boolean;
}
