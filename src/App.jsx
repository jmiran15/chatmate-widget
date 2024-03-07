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
      <div className="fixed p-0 m-0 border-none bottom-[20px] right-[20px] z-9999">
        <div
          style={{
            width: isChatOpen ? (isMobile ? "100vw" : 320) : "auto",
            height: isChatOpen ? (isMobile ? "100vh" : "93vh") : "auto",
          }}
          // className={`${
          //   isChatOpen
          //     ? isMobile
          //       ? "bg-white px-4 py-2"
          //       : "max-w-md px-4 py-2 bg-white rounded-lg border shadow-lg w-72"
          //     : "w-16 h-16 rounded-full"
          // }`}
        >
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
      </div>
    </>
  );
}
