import {
  ChatBubbleLeftEllipsisIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Chatbot } from "src/utils/types";
import { colors } from "../utils/constants";

const CHAT_ICONS = {
  plus: PlusIcon,
  chevron: ChevronDoubleUpIcon,
  chat: ChatBubbleLeftEllipsisIcon,
};

const OpenButton = React.memo(
  ({
    isOpen,
    toggleOpen,
    chatbot,
    pending,
  }: {
    isOpen: boolean;
    toggleOpen: () => void;
    chatbot: Chatbot;
    pending: number;
  }) => {
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
      if (isOpen) {
        setShouldAnimate(true);
      }
    }, [isOpen]);

    const isLeftAligned = chatbot.widgetPosition === "BOTTOM_LEFT";

    const ChatIcon =
      CHAT_ICONS[(chatbot?.openIcon || "plus") as keyof typeof CHAT_ICONS] ||
      CHAT_ICONS.plus;
    const buttonClasses = `flex items-center justify-center p-0 rounded-full bg-${
      colors[chatbot?.themeColor as keyof typeof colors]
    } text-white text-2xl border-none shadow-lg focus:outline-none cursor-pointer box-content m-0`;
    const iconClasses = "text-white w-[24px] h-[24px]";

    return (
      <motion.div
        className="fixed bottom-[20px] z-[9999]"
        initial={!isOpen ? { y: 100, opacity: 0 } : { y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.5,
        }}
        style={{
          [isLeftAligned ? "left" : "right"]: "20px",
        }}
      >
        <motion.div
          className={`${buttonClasses} ${
            chatbot.openButtonText && !isOpen
              ? "px-3 h-[48px] w-auto"
              : "w-[48px] h-[48px]"
          } relative`}
          aria-label="Toggle Menu"
          onClick={toggleOpen}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={shouldAnimate ? { rotate: -90 } : { rotate: 0 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ChevronDownIcon className={iconClasses} />
                </motion.div>
              ) : (
                <ChatIcon className={iconClasses} />
              )}
            </AnimatePresence>
            {chatbot.openButtonText && !isOpen && (
              <span className="mx-2 text-sm font-semibold whitespace-nowrap overflow-hidden">
                {chatbot.openButtonText}
              </span>
            )}
          </div>
          {pending > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
              initial={false}
              animate={{
                scale: 1,
                x: 2,
                y: -2,
              }}
            >
              <div
                className="w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-600"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24), inset 0 -1px 1px rgba(0,0,0,0.1)",
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ textShadow: "0 0.5px 1px rgba(0,0,0,0.1)" }}
              >
                {pending > 9 ? "9+" : pending}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }
);

export default OpenButton;
