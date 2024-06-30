import useOpenChat from "./hooks/use-open-chat";
import useSessionId from "./hooks/use-session";
import useChatbot from "./hooks/use-chatbot";

import Head from "@/components/Head";
import OpenButton from "./components/open-button";
import ChatWindow from "./components/chat-window";
import { useMobileScreen } from "./utils/mobile";
import useChat from "./hooks/use-chat";
import { useEffect, useState } from "react";
import PendingMessages from "./components/pending-messages";
import { API_PATH } from "./utils/constants";

export default function App({ embedId }) {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const sessionId = useSessionId(embedId);
  const isMobile = useMobileScreen();
  const chatbot = useChatbot(embedId);
  const { pendingCount, chatHistory, setChatHistory, loading } = useChat({
    chatbot,
    sessionId,
  });

  const [pending, setPending] = useState(0);
  const [starterMessages, setStarterMessages] = useState([]);

  useEffect(() => {
    setStarterMessages(
      chatbot?.introMessages
        ? () =>
            chatHistory.filter((message) =>
              chatbot.introMessages.includes(message.content)
            )
        : []
    );
    setPending(pendingCount);
  }, [pendingCount, chatbot]);

  console.log("App -> pending", pending);
  console.log("App -> starterMessages", starterMessages);
  console.log("App -> chatHistory", chatHistory);

  if (!embedId) return null;
  if (!chatbot) return null;

  const dismissPreviews = () => {
    // Mark starter messages as seen
    starterMessages.forEach((message) => {
      fetch(`${API_PATH}/api/seen/${message.id}`, { method: "POST" });
    });

    console.log("dismissPreviews -> setStarterMessages", []);
    setStarterMessages([]);
  };

  return (
    <>
      <Head />
      <div>
        {isChatOpen && (
          <ChatWindow
            closeChat={() => toggleOpenChat(false)}
            embedId={embedId}
            sessionId={sessionId}
            chatbot={chatbot}
            chatbotId={embedId}
            pendingCount={pending}
            setPendingCount={setPending}
          />
        )}
        {(!isMobile || !isChatOpen) && (
          <>
            <PendingMessages
              starterMessages={starterMessages}
              openChat={() => toggleOpenChat(true)}
              dismissPreviews={dismissPreviews}
            />
            <OpenButton
              embedId={embedId}
              isOpen={isChatOpen}
              toggleOpen={() => toggleOpenChat(!isChatOpen)}
              chatbot={chatbot}
              pendingCount={pending}
            />
          </>
        )}
      </div>
    </>
  );
}
