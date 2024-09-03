import React, { useCallback, useEffect, useMemo } from "react";
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
    shadowRoot,
  }: {
    handleUserActivity: () => void;
    closeChat: () => void;
    shadowRoot: ShadowRoot | null;
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
      [isMobile, chatbot?.containerRadius, isLeftAligned]
    );

    // TOOD - copy code doesn't work - probably because the widget is inside a shadow root.
    const copyCodeSnippet = useCallback(
      (uuid: string) => {
        if (!shadowRoot) return false;

        const target = shadowRoot.querySelector(`[data-code="code-${uuid}"]`);
        if (!target) return false;

        const codeBlock = target
          .closest(".whitespace-pre-line")
          ?.querySelector("pre");
        const codeContent = codeBlock?.textContent;
        if (!codeContent) return false;

        navigator.clipboard.writeText(codeContent.trim());

        const buttonText = target.querySelector("p");
        if (buttonText) {
          const originalText = buttonText.textContent;
          buttonText.textContent = "Copied!";
          target.setAttribute("disabled", "true");

          setTimeout(() => {
            buttonText.textContent = originalText;
            target.removeAttribute("disabled");
          }, 2500);
        }

        return true;
      },
      [shadowRoot]
    );

    useEffect(() => {
      if (!shadowRoot) return;

      const handleClick = (e: Event) => {
        const target = (e.target as Element).closest("[data-code-snippet]");
        if (target) {
          const uuidCode = target.getAttribute("data-code");
          if (uuidCode) {
            e.preventDefault();
            copyCodeSnippet(uuidCode.replace("code-", ""));
          }
        }
      };

      shadowRoot.addEventListener("click", handleClick);
      return () => shadowRoot.removeEventListener("click", handleClick);
    }, [copyCodeSnippet, shadowRoot]);

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
  }
);

export default ChatWindow;
