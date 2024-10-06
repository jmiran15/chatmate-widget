import React, { useCallback, useEffect, useMemo } from "react";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useMobileScreen } from "../utils/mobile";
import ChatContainer from "./chatContainer";
import ChatWindowHeader from "./chatHeader";
import { ChatHistoryLoading } from "./chatHistory";

// TODO - we no longer have a shadow root, so revamp to work regularly

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
      async (uuid: string) => {
        if (!shadowRoot) return false;

        const target = shadowRoot.querySelector(`[data-code="code-${uuid}"]`);
        if (!target) return false;

        const codeBlock = target
          .closest(".whitespace-pre-line")
          ?.querySelector("pre");
        const codeContent = codeBlock?.textContent;
        if (!codeContent) return false;

        try {
          await navigator.clipboard.writeText(codeContent.trim());

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
        } catch (err) {
          console.error("Failed to copy text: ", err);
          return false;
        }
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

    // Chat window
    // TODO - do this in tailwind
    // .chat-window-custom {
    //   height: min(704px, 100% - 104px);
    //   box-shadow: rgba(0, 0, 0, 0.16) 0px 5px 40px;
    // }

    if (loading) {
      return (
        <div
          className={`cm-flex cm-flex-col cm-flex-1 cm-fixed cm-bottom-[84px] cm-z-[9999] cm-min-h-[80px] cm-w-[400px] cm-max-h-[704px] cm-opacity-100 cm-overflow-hidden cm-h-[min(704px,calc(100%-104px))] cm-shadow-[0_5px_40px_rgba(0,0,0,0.16)]`}
          style={containerStyle}
        >
          <ChatWindowHeader closeChat={closeChat} />
          <ChatHistoryLoading />
        </div>
      );
    }

    return (
      <div
        className={`cm-flex cm-flex-col cm-flex-1 cm-fixed ${
          isMobile
            ? "cm-bottom-0 cm-right-0 cm-h-dvh cm-w-dvw"
            : "cm-bottom-[84px] cm-min-h-[80px] cm-w-[400px] cm-max-h-[704px]"
        } cm-z-[9999] cm-opacity-100 cm-overflow-hidden cm-h-[min(704px,calc(100%-104px))] cm-shadow-[0_5px_40px_rgba(0,0,0,0.16)]`}
        style={containerStyle}
      >
        <ChatWindowHeader closeChat={closeChat} />
        <ChatContainer handleUserActivity={handleUserActivity} />
      </div>
    );
  }
);

export default ChatWindow;
