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

// this is supposed to be the message type in in api.chatmate
export interface Message {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  role: string;
  content: string | null;
  chatId?: string;
  seen?: boolean;
  close?: boolean;
}

// this is the SSE type in api.chatmate
export interface SSEMessage {
  id: string;
  type: "textResponseChunk" | "abort";
  textResponse: string | null;
  error: string | null;
  streaming: boolean;
}
