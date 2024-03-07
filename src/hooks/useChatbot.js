import { useEffect, useState } from "react";

export default function useChatbot(chatbotId) {
  const [chatbot, setChatbot] = useState(null);
  useEffect(() => {
    fetch(`http://localhost:3000/api/chatbot/${chatbotId}`)
      .then((res) => res.json())
      .then((data) => setChatbot(data));
  }, [chatbotId]);
  return chatbot;
}
