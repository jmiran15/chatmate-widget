import {
  Plus,
  ChatCircleDots,
  Headset,
  Binoculars,
  MagnifyingGlass,
  MagicWand,
} from "@phosphor-icons/react";

import {
  PlusIcon,
  ChevronDoubleUpIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/App";

const CHAT_ICONS = {
  plus: PlusIcon,
  chevron: ChevronDoubleUpIcon,
  chat: ChatBubbleLeftEllipsisIcon,
};

export default function OpenButton({ settings, isOpen, toggleOpen, chatbot }) {
  // if (isOpen) return null;
  const ChatIcon = CHAT_ICONS.hasOwnProperty(chatbot?.openIcon)
    ? CHAT_ICONS[chatbot.openIcon]
    : CHAT_ICONS.plus;
  return (
    <div
      onClick={toggleOpen}
      className={`fixed bottom-[20px] right-[20px] z-[9999] flex items-center justify-center p-0 m-0 rounded-full bg-${colors[chatbot.themeColor]} text-white text-2xl max-w-[48px] w-[48px] max-h-[48px] h-[48px] border-none shadow-lg focus:outline-none cursor-pointer box-content button-hover-effect shadow-custom transition-custom`}
      aria-label="Toggle Menu"
    >
      {isOpen ? (
        <ChevronDownIcon className="text-white w-[24px] h-[24px]" />
      ) : (
        <ChatIcon className="text-white w-[24px] h-[24px]" />
      )}
    </div>
  );
}
