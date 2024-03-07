import {
  Plus,
  ChatCircleDots,
  Headset,
  Binoculars,
  MagnifyingGlass,
  MagicWand,
} from "@phosphor-icons/react";

const CHAT_ICONS = {
  plus: Plus,
  chatBubble: ChatCircleDots,
  support: Headset,
  search2: Binoculars,
  search: MagnifyingGlass,
  magic: MagicWand,
};

export default function OpenButton({ settings, isOpen, toggleOpen }) {
  if (isOpen) return null;
  const ChatIcon = CHAT_ICONS.hasOwnProperty(settings?.chatIcon)
    ? CHAT_ICONS[settings.chatIcon]
    : CHAT_ICONS.plus;
  return (
    <div
      onClick={toggleOpen}
      className={`flex items-center justify-center p-0 m-0 rounded-full bg-orange-500 text-white text-2xl max-w-[48px] w-[48px] max-h-[48px] h-[48px] border-none shadow-lg focus:outline-none cursor-pointer box-content button-hover-effect shadow-custom transition-custom`}
      aria-label="Toggle Menu"
    >
      <ChatIcon className="text-white" />
    </div>
  );
}
