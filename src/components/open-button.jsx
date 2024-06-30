import {
  PlusIcon,
  ChevronDoubleUpIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { colors } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";

const CHAT_ICONS = {
  plus: PlusIcon,
  chevron: ChevronDoubleUpIcon,
  chat: ChatBubbleLeftEllipsisIcon,
};

export default function OpenButton({ isOpen, toggleOpen, chatbot }) {
  const ChatIcon = CHAT_ICONS.hasOwnProperty(chatbot?.openIcon)
    ? CHAT_ICONS[chatbot.openIcon]
    : CHAT_ICONS.plus;

  const buttonClasses = `fixed bottom-[20px] right-[20px] z-[9999] flex items-center justify-center p-0 rounded-full bg-${
    colors[chatbot?.themeColor]
  } text-white text-2xl border-none shadow-lg focus:outline-none cursor-pointer box-content button-hover-effect shadow-custom m-0 
  text-white text-2xl max-w-[48px] w-[48px] max-h-[48px] h-[48px] border-none shadow-lg focus:outline-none cursor-pointer box-content button-hover-effect shadow-custom transition-custom
  `;

  const iconClasses = "text-white w-[24px] h-[24px]";

  return (
    <motion.div
      className={`${buttonClasses} ${
        chatbot.openButtonText && !isOpen
          ? "pr-4 pl-3 py-2"
          : "w-[48px] h-[48px]"
      }`}
      aria-label="Toggle Menu"
      onClick={toggleOpen}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{ overflow: "hidden" }}
    >
      <div className="flex items-center">
        {isOpen ? (
          <ChevronDownIcon className={iconClasses} />
        ) : (
          <ChatIcon className={iconClasses} />
        )}
        <AnimatePresence>
          {chatbot.openButtonText && !isOpen ? (
            <motion.span
              className="ml-2 text-sm font-semibold whitespace-nowrap overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {chatbot.openButtonText}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
