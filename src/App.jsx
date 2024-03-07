import useGetScriptAttributes from "@/hooks/useScriptAttributes";
import useSessionId from "@/hooks/useSessionId";
import useOpenChat from "@/hooks/useOpen";
import Head from "@/components/Head";
import OpenButton from "./components/open-button";
import ChatWindow from "./components/chat-window";
import { useEffect } from "react";
import { useMobileScreen } from "./utils/mobile";
import useChatbot from "./hooks/useChatbot";

export default function App() {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const embedSettings = useGetScriptAttributes();
  const sessionId = useSessionId();
  const isMobile = useMobileScreen();
  const chatbot = useChatbot(embedSettings.embedId);

  useEffect(() => {
    if (embedSettings.openOnLoad === "on") {
      toggleOpenChat(true);
    }
  }, [embedSettings.loaded]);

  if (!embedSettings.loaded) return null;
  return (
    <>
      <Head />
      <div>
        {isChatOpen && (
          <ChatWindow
            closeChat={() => toggleOpenChat(false)}
            settings={embedSettings}
            sessionId={sessionId}
            chatbot={chatbot}
            chatbotId={embedSettings.embedId}
          />
        )}
        <OpenButton
          settings={embedSettings}
          isOpen={isChatOpen}
          toggleOpen={() => toggleOpenChat(true)}
        />
      </div>
    </>
  );
}
