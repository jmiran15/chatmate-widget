import ChatmateLogo from "@/assets/chatmatelogo.jpeg";
import ChatService from "@/models/chatService";
import {
  DotsThreeOutlineVertical,
  Envelope,
  Lightning,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

export default function ChatWindowHeader({
  sessionId,
  settings = {},
  iconUrl = null,
  closeChat,
  setChatHistory,
}) {
  const [showingOptions, setShowOptions] = useState(false);

  const handleChatReset = async () => {
    await ChatService.resetEmbedChatSession(settings, sessionId);
    setChatHistory([]);
    setShowOptions(false);
  };

  EllipsisVerticalIcon;

  return (
    <nav className="flex flex-col bg-orange-300 p-[8px] chat-header-bottom-border">
      <div className="flex flex-row flex-1 items-center justify-between gap-[2px] min-h-[48px] text-[18px]">
        <button className="flex flex-row gap-[12px] max-h-[48px] h-[48px] min-w-[48px] bg-transparent border-none box-border rounded-[10px] w-full p-[6px] items-center chat-header-button chat-header-btn">
          <img
            className="rounded-full max-h-[32px] h-[32px] w-[32px] max-w-[32px] chat-header-image"
            src={iconUrl ?? ChatmateLogo}
            alt={iconUrl ? "Brand" : "Chatmate Logo"}
          />
          <div className="flex flex-col items-start">
            <h1 className="text-[16px] font-[600] text-white">Chatmate</h1>
            <div className="text-[14px]">AI chat</div>
          </div>
        </button>
        {settings.loaded && (
          <button
            type="button"
            onClick={() => setShowOptions(!showingOptions)}
            className="min-w-[48px] max-h-[48px] h-[48px] w-[48px] bg-transparent border-none box-border rounded-[10px] flex items-center justify-center px-[12px] text-white settings-button chat-header-btn"
          >
            <EllipsisVerticalIcon className="text-white w-auto min-h-[24px] h-[24px]" />
          </button>
        )}
      </div>
      <OptionsMenu
        settings={settings}
        showing={showingOptions}
        resetChat={handleChatReset}
      />
    </nav>
  );
}

function OptionsMenu({ settings, showing, resetChat }) {
  console.log("rendering options menu", showing, settings.supportEmail);
  if (!showing) return null;
  return (
    <div className="absolute z-10 bg-white flex flex-col gap-y-1 rounded-lg shadow-lg border border-gray-300 top-[23px] right-[20px] max-w-[150px]">
      <button
        onClick={resetChat}
        className="flex items-center gap-x-1 hover:bg-gray-100 text-sm text-gray-700 p-2 rounded-lg"
      >
        <Lightning size={14} />
        <p>Reset Chat</p>
      </button>
      <ContactSupport email={"jmiran15@jhu.edu"} />
    </div>
  );
}

function ContactSupport({ email = null }) {
  if (!email) return null;
  console.log("rendering contact support", email);

  const subject = `Inquiry from ${window.location.origin}`;
  return (
    <a
      href={`mailto:${email}?Subject=${encodeURIComponent(subject)}`}
      className="flex items-center gap-x-1 hover:bg-gray-100 text-sm text-gray-700 p-2 rounded-lg"
    >
      <Envelope size={14} />
      <p>Email support</p>
    </a>
  );
}
