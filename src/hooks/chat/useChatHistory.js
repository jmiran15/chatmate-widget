import ChatService from "@/models/chatService";
import { useEffect, useState } from "react";

export default function useChatHistory(embedId = null, sessionId = null) {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchChatHistory() {
      if (!sessionId || !embedId) return;
      try {
        const formattedMessages = await ChatService.embedSessionHistory(
          embedId,
          sessionId
        );
        setMessages(formattedMessages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching historical chats:", error);
        setLoading(false);
      }
    }
    fetchChatHistory();
  }, [sessionId, embedId]);

  return { chatHistory: messages, setChatHistory: setMessages, loading };
}
