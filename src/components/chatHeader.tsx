import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import React, { useCallback, useState } from "react";
import { useIsAgent } from "../hooks/useIsAgent";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useSocket } from "../providers/socket";
import { colors } from "../utils/constants";
import { useMobileScreen } from "../utils/mobile";

const ChatWindowHeader = React.memo(
  ({ closeChat }: { closeChat: () => void }) => {
    const [showingOptions, setShowOptions] = useState(false);
    const { resetSession, chat } = useSessionContext();
    const chatbot = useChatbot();
    const isMobile = useMobileScreen();
    const socket = useSocket();
    const { isAgent } = useIsAgent({ chatId: chat?.id, socket });

    const handleChatReset = useCallback(async () => {
      try {
        const res = await resetSession();
        if (res) {
          setShowOptions(false);
        } else {
          throw new Error("Failed to reset chat");
        }
      } catch (error) {
        console.error("Error resetting chat:", error);
      }
    }, [resetSession]);

    const toggleOptions = useCallback(() => {
      setShowOptions((prev) => !prev);
    }, []);

    const headerBgColor = colors[chatbot?.themeColor ?? "zinc"];

    return (
      <nav
        className={`cm-flex cm-flex-col cm-p-2 cm-border-b cm-border-black/10 ${headerBgColor}`}
      >
        <div className="cm-flex cm-items-center cm-justify-between cm-gap-2 cm-min-h-[48px] cm-text-lg">
          <button className="cm-flex cm-items-center cm-gap-3 cm-h-12 cm-bg-transparent cm-border-none cm-rounded-lg cm-w-full cm-p-1.5 cm-text-white/70 cm-transition-colors cm-duration-250 hover:cm-bg-black/20">
            {chatbot?.croppedLogoFilepath && (
              <img
                className="cm-rounded-full cm-h-8 cm-w-8 cm-object-cover cm-overflow-hidden"
                src={chatbot.croppedLogoFilepath}
                alt={chatbot.publicName}
              />
            )}
            <div className="cm-flex cm-flex-col cm-items-start">
              <h1 className="cm-text-base cm-font-semibold cm-text-white">
                {chatbot?.publicName}
              </h1>
              <div className="cm-text-sm cm-text-white/80">
                Chatting with {isAgent ? "Agent" : "AI"}
              </div>
            </div>
          </button>
          <HeaderButton onClick={toggleOptions} ariaLabel="Options">
            <EllipsisVerticalIcon className="cm-text-white cm-w-6 cm-h-6" />
          </HeaderButton>
          {isMobile && (
            <HeaderButton onClick={closeChat} ariaLabel="Close chat">
              <XMarkIcon className="cm-text-white cm-w-6 cm-h-6" />
            </HeaderButton>
          )}
        </div>
        <OptionsMenu showing={showingOptions} resetChat={handleChatReset} />
      </nav>
    );
  }
);

const HeaderButton = React.memo(
  ({
    onClick,
    ariaLabel,
    children,
  }: {
    onClick: () => void;
    ariaLabel: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="cm-w-12 cm-h-12 cm-bg-transparent cm-border-none cm-rounded-lg cm-flex cm-items-center cm-justify-center cm-text-white cm-transition-colors cm-duration-200 hover:cm-bg-white/10"
    >
      {children}
    </button>
  )
);

const OptionsMenu = React.memo(
  ({ showing, resetChat }: { showing: boolean; resetChat: () => void }) => {
    if (!showing) return null;
    return (
      <div className="cm-absolute cm-z-[9999] cm-bg-white cm-flex cm-flex-col cm-gap-y-1 cm-rounded-lg cm-shadow-lg cm-border cm-border-gray-300 cm-top-14 cm-right-2 cm-w-36">
        <button
          onClick={resetChat}
          className="cm-flex cm-items-center cm-gap-x-2 hover:cm-bg-gray-100 cm-text-sm cm-text-gray-700 cm-p-2 cm-rounded-lg cm-transition-colors cm-duration-200"
        >
          <BoltIcon className="cm-w-4 cm-h-4" />
          <span>Reset Chat</span>
        </button>
      </div>
    );
  }
);

export default ChatWindowHeader;
