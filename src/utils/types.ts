import { FormElement } from "src/hooks/useAutoForm";

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

  isFormMessage?: boolean;
  formId?: string;
  form?: Form;
  formSubmission?: FormSubmission;

  flowId?: string;
}

interface Form {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  chatbotId: string;
  elements: FormElement[];
}

interface FormSubmission {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  formId: string;
  form: Form;
  submissionData: any;
  messageId?: string;
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

interface DelayInformation {
  delay?: number;
}
export interface Message
  extends PrismaMessage,
    TypingInformation,
    StreamingInformation,
    DelayInformation {}

// this is the SSE type in api.chatmate
export interface SSEMessage {
  id: string;
  type: "textResponseChunk" | "abort";
  textResponse: string | null;
  error: string | null;
  streaming: boolean;
}
