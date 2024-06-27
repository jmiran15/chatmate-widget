import { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { BoltIcon, EnvelopeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMobileScreen } from "@/utils/mobile";
import { colors } from "../utils/constants";
import { resetSession } from "../hooks/use-chat";

export default function ChatWindowHeader({
  sessionId,
  embedId,
  closeChat,
  setChatHistory,
  chatbot,
}) {
  const [showingOptions, setShowOptions] = useState(false);
  const isMobile = useMobileScreen();

  const handleChatReset = async () => {
    await resetSession(embedId, sessionId);
    setChatHistory([]);
    setShowOptions(false);
  };

  return (
    <nav
      className={`flex flex-col p-[8px] chat-header-bottom-border bg-${colors[chatbot.themeColor]}`}
    >
      <div className="flex flex-row flex-1 items-center justify-between gap-[2px] min-h-[48px] text-[18px]">
        <button className="flex flex-row gap-[12px] max-h-[48px] h-[48px] min-w-[48px] bg-transparent border-none box-border rounded-[10px] w-full p-[6px] items-center chat-header-button chat-header-btn">
          <img
            className="rounded-full max-h-[32px] h-[32px] w-[32px] max-w-[32px] chat-header-image"
            src={chatbot.logoUrl}
            alt={"logo"}
          />
          <div className="flex flex-col items-start">
            <h1 className="text-[16px] font-[600] text-white">
              {chatbot.publicName}
            </h1>
            <div className="text-[14px]">AI chat</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setShowOptions(!showingOptions)}
          className="min-w-[48px] max-h-[48px] h-[48px] w-[48px] bg-transparent border-none box-border rounded-[10px] flex items-center justify-center px-[12px] text-white settings-button chat-header-btn"
        >
          <EllipsisVerticalIcon className="text-white w-auto min-h-[24px] h-[24px]" />
        </button>

        {isMobile && (
          <button
            type="button"
            onClick={closeChat}
            className="min-w-[48px] max-h-[48px] h-[48px] w-[48px] bg-transparent border-none box-border rounded-[10px] flex items-center justify-center px-[12px] text-white settings-button chat-header-btn"
          >
            <XMarkIcon className="text-white w-auto min-h-[24px] h-[24px]" />
          </button>
        )}
      </div>
      <OptionsMenu
        embedId={embedId}
        showing={showingOptions}
        resetChat={handleChatReset}
      />
    </nav>
  );
}

function OptionsMenu({ embedId, showing, resetChat }) {
  if (!showing) return null;
  return (
    <div className="absolute z-10 bg-white flex flex-col gap-y-1 rounded-lg shadow-lg border border-gray-300 top-[23px] right-[20px] max-w-[150px]">
      <button
        onClick={resetChat}
        className="flex items-center gap-x-1 hover:bg-gray-100 text-sm text-gray-700 p-2 rounded-lg"
      >
        <BoltIcon className="w-[16px] h-[16px]" />
        <p>Reset Chat</p>
      </button>
      {/* <ContactSupport email={"jmiran15@jhu.edu"} /> */}
    </div>
  );
}

function ContactSupport({ email = null }) {
  if (!email) return null;

  const subject = `Inquiry from ${window.location.origin}`;
  return (
    <a
      href={`mailto:${email}?Subject=${encodeURIComponent(subject)}`}
      className="flex items-center gap-x-1 hover:bg-gray-100 text-sm text-gray-700 p-2 rounded-lg"
    >
      <EnvelopeIcon className="w-[16px] h-[16px]" />
      <p>Email support</p>
    </a>
  );
}
