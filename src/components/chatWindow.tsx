import React, { useCallback, useMemo } from "react";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useMobileScreen } from "../utils/mobile";
import ChatContainer from "./chatContainer";
import ChatWindowHeader from "./chatHeader";
import { ChatHistoryLoading } from "./chatHistory";

const ChatWindow = React.memo(
  ({
    handleUserActivity,
    closeChat,
  }: {
    handleUserActivity: () => void;
    closeChat: () => void;
  }) => {
    const chatbot = useChatbot();
    const isMobile = useMobileScreen();
    const isLeftAligned = chatbot?.widgetPosition === "BOTTOM_LEFT";
    const { loading } = useSessionContext();

    const containerStyle = useMemo(
      () => ({
        borderRadius: isMobile ? "0rem" : `${chatbot?.containerRadius}rem`,
        ...(isMobile ? {} : { [isLeftAligned ? "left" : "right"]: "20px" }),
      }),
      [isMobile, chatbot?.containerRadius, isLeftAligned],
    );

    // TOOD - copy code doesn't work - probably because the widget is inside a shadow root.
    const copyCodeSnippet = useCallback((uuid: string) => {
      const target = document.querySelector(`[data-code="${uuid}"]`);
      if (!target) return false;

      const markdown =
        target.parentElement?.parentElement?.querySelector(
          "pre:first-of-type",
        )?.textContent;
      if (!markdown) return false;

      navigator.clipboard.writeText(markdown);
      target.classList.add("text-green-500");
      const originalText = target.innerHTML;
      target.textContent = "Copied!";
      target.setAttribute("disabled", "true");

      setTimeout(() => {
        target.classList.remove("text-green-500");
        target.innerHTML = originalText;
        target.removeAttribute("disabled");
      }, 2500);
    }, []);

    React.useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        const target = (e.target as Element).closest("[data-code-snippet]");
        const uuidCode = target?.getAttribute("data-code");
        if (uuidCode) copyCodeSnippet(uuidCode);
      };

      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }, [copyCodeSnippet]);

    if (loading) {
      return (
        <div
          className={`flex flex-col flex-1 fixed bottom-[84px] z-[9999] min-h-[80px] w-[400px] max-h-[704px] opacity-100 overflow-hidden chat-window-custom`}
          style={containerStyle}
        >
          <ChatWindowHeader closeChat={closeChat} />
          <ChatHistoryLoading />
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col flex-1 fixed ${
          isMobile
            ? "bottom-0 right-0 h-dvh w-dvw"
            : "bottom-[84px] min-h-[80px] w-[400px] max-h-[704px]"
        } z-[9999] opacity-100 overflow-hidden chat-window-custom`}
        style={containerStyle}
      >
        <ChatWindowHeader closeChat={closeChat} />
        <ChatContainer handleUserActivity={handleUserActivity} />
      </div>
    );
  },
);

export default ChatWindow;
