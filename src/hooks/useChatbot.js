import { useEffect, useState } from "react";

export default function useChatbot(chatbotId) {
  const [chatbot, setChatbot] = useState(null);
  useEffect(() => {
    fetch(`https://chatmate.fly.dev/api/chatbot/${chatbotId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("the data: ", data);
        setChatbot(data);
      });
  }, [chatbotId]);
  return chatbot;
}
