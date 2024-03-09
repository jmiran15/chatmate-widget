import useGetScriptAttributes from "@/hooks/useScriptAttributes";
import useSessionId from "@/hooks/useSessionId";
import useOpenChat from "@/hooks/useOpen";
import Head from "@/components/Head";
import OpenButton from "./components/open-button";
import ChatWindow from "./components/chat-window";
import { useEffect } from "react";
import { useMobileScreen } from "./utils/mobile";
import useChatbot from "./hooks/useChatbot";

export const colors = {
  zinc: "zinc-900",
  red: "red-600",
  orange: "orange-500",
  amber: "amber-400",
  yellow: "yellow-300",
  lime: "lime-300",
  green: "green-600",
  emerald: "emerald-600",
  teal: "teal-600",
  cyan: "cyan-300",
  sky: "sky-500",
  blue: "blue-600",
  indigo: "indigo-500",
  violet: "violet-500",
  purple: "purple-500",
  fuchsia: "fuchsia-500",
  pink: "pink-500",
  rose: "rose-500",
};

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

  console.log("the chatbot: ", chatbot);

  if (!chatbot) return null;

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
        {(!isMobile || !isChatOpen) && (
          <OpenButton
            settings={embedSettings}
            isOpen={isChatOpen}
            toggleOpen={() => toggleOpenChat(!isChatOpen)}
            chatbot={chatbot}
          />
        )}
      </div>
    </>
  );
}
