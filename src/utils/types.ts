export interface Chatbot {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  publicName: string;
  originalLogoFilepath: string;
  croppedLogoFilepath: string;
  lastCrop: string;
  themeColor: string;
  introMessages: string[];
  openIcon: string;
  starterQuestions: string[];
  name: string;
  systemPrompt: string;
  model: string;
  responseLength: string;
  containerRadius: String;
  openButtonText: String;
  widgetRestrictedUrls: String[];

  // installation stuff
  installed: boolean;
  lastPingedAt: string;
  embeddedOn: string;

  widgetPosition: "BOTTOM_RIGHT" | "BOTTOM_LEFT";
}

export interface Message {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  role: string;
  content: string | null;
  chatId?: string;
  seen?: boolean;
}

export interface ChatResult {
  uuid: string;
  type: "textResponseChunk" | "textResponse" | "abort";
  textResponse: string | null;
  sources: string[];
  error: string | null;
  close: boolean;
}
