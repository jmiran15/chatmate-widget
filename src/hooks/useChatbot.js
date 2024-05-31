import { useEffect, useState } from "react";

export default function useChatbot(chatbotId) {
  const [chatbot, setChatbot] = useState(null);
  useEffect(() => {
    fetch(`https://chatmate.so/api/chatbot/${chatbotId}`)
      .then((res) => res.json())
      .then((data) => {
        setChatbot(data);
      });
  }, [chatbotId]);
  return chatbot;
}
