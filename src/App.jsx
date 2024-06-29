import useOpenChat from "./hooks/use-open-chat";
import useSessionId from "./hooks/use-session";
import useChatbot from "./hooks/use-chatbot";

import Head from "@/components/Head";
import OpenButton from "./components/open-button";
import ChatWindow from "./components/chat-window";
import { useMobileScreen } from "./utils/mobile";

export default function App({ embedId }) {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const sessionId = useSessionId(embedId);
  const isMobile = useMobileScreen();
  const chatbot = useChatbot(embedId);

  if (!embedId) return null;
  if (!chatbot) return null;

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
          />
        )}
        {(!isMobile || !isChatOpen) && (
          <OpenButton
            embedId={embedId}
            isOpen={isChatOpen}
            toggleOpen={() => toggleOpenChat(!isChatOpen)}
            chatbot={chatbot}
          />
        )}
      </div>
    </>
  );
}
