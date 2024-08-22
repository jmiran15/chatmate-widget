import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import React, { useCallback, useMemo, useState } from "react";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { colors } from "../utils/constants";
import { useMobileScreen } from "../utils/mobile";

const ChatWindowHeader = React.memo(
  ({ closeChat }: { closeChat: () => void }) => {
    const [showingOptions, setShowOptions] = useState(false);
    const { resetSession } = useSessionContext();
    const chatbot = useChatbot();
    const isMobile = useMobileScreen();

    const handleChatReset = useCallback(async () => {
      const res = await resetSession();
      if (res) {
        setShowOptions(false);
      }
    }, [resetSession]);

    const toggleOptions = useCallback(() => {
      setShowOptions((prev) => !prev);
    }, []);

    const headerBgColor = useMemo(
      () =>
        `bg-${colors[(chatbot?.themeColor ?? "zinc") as keyof typeof colors]}`,
      [chatbot?.themeColor],
    );

    return (
      <nav
        className={`flex flex-col p-2 chat-header-bottom-border ${headerBgColor}`}
      >
        <div className="flex items-center justify-between gap-2 min-h-[48px] text-lg">
          <button className="flex items-center gap-3 h-12 bg-transparent border-none rounded-lg w-full p-1.5 chat-header-button chat-header-btn">
            {chatbot?.croppedLogoFilepath && (
              <img
                className="rounded-full h-8 w-8 object-cover chat-header-image"
                src={chatbot.croppedLogoFilepath}
                alt={chatbot.publicName}
              />
            )}
            <div className="flex flex-col items-start">
              <h1 className="text-base font-semibold text-white">
                {chatbot?.publicName}
              </h1>
              <div className="text-sm text-white/80">AI chat</div>
            </div>
          </button>
          <HeaderButton onClick={toggleOptions} ariaLabel="Options">
            <EllipsisVerticalIcon className="text-white w-6 h-6" />
          </HeaderButton>
          {isMobile && (
            <HeaderButton onClick={closeChat} ariaLabel="Close chat">
              <XMarkIcon className="text-white w-6 h-6" />
            </HeaderButton>
          )}
        </div>
        <OptionsMenu showing={showingOptions} resetChat={handleChatReset} />
      </nav>
    );
  },
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
      className="w-12 h-12 bg-transparent border-none rounded-lg flex items-center justify-center text-white settings-button chat-header-btn transition-colors duration-200 hover:bg-white/10"
    >
      {children}
    </button>
  ),
);

const OptionsMenu = React.memo(
  ({ showing, resetChat }: { showing: boolean; resetChat: () => void }) => {
    if (!showing) return null;
    return (
      <div className="absolute z-10 bg-white flex flex-col gap-y-1 rounded-lg shadow-lg border border-gray-300 top-14 right-2 w-36">
        <button
          onClick={resetChat}
          className="flex items-center gap-x-2 hover:bg-gray-100 text-sm text-gray-700 p-2 rounded-lg transition-colors duration-200"
        >
          <BoltIcon className="w-4 h-4" />
          <span>Reset Chat</span>
        </button>
      </div>
    );
  },
);

export default ChatWindowHeader;
