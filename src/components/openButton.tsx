// TODO - should probably use consistent icons throughout the app
// TODO - make a "Chatmate" logo icon, like Pylon, Itercom, Chatwoot, etc...
import {
  ChatBubbleLeftEllipsisIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import { colors } from "../utils/constants";
import { Chatbot } from "../utils/types";
import { cn } from "./lib/utils";

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
    const isLeftAligned = chatbot.widgetPosition === "BOTTOM_LEFT";
    const ChatIcon = useMemo(
      () =>
        CHAT_ICONS[(chatbot?.openIcon || "plus") as keyof typeof CHAT_ICONS] ||
        CHAT_ICONS.plus,
      [chatbot?.openIcon]
    );
    const themeColorClass = colors[chatbot?.themeColor ?? "zinc"];

    const buttonClasses = cn(
      "cm-flex cm-items-center cm-justify-center cm-p-0 cm-rounded-full",
      themeColorClass,
      "cm-text-white cm-text-2xl cm-border-none cm-shadow-lg cm-focus:outline-none cm-cursor-pointer cm-box-content cm-m-0"
    );
    const iconClasses = "cm-text-white cm-w-[24px] cm-h-[24px]";

    return (
      <motion.div
        className="cm-fixed cm-bottom-[20px] cm-z-[9999]"
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
              ? "cm-px-3 cm-h-[48px] cm-w-auto"
              : "cm-w-[48px] cm-h-[48px]"
          } cm-relative`}
          aria-label="Toggle Menu"
          onClick={toggleOpen}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="cm-flex cm-items-center">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={isOpen ? { rotate: -90 } : { rotate: 0 }}
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
              <span className="cm-mx-2 cm-overflow-hidden cm-text-sm cm-font-semibold cm-whitespace-nowrap">
                {chatbot.openButtonText}
              </span>
            )}
          </div>
          {pending > 0 && (
            <motion.div
              className="cm-absolute cm-flex cm-items-center cm-justify-center cm-w-5 cm-h-5 cm--top-1 cm--right-1"
              initial={false}
              animate={{
                scale: 1,
                x: 2,
                y: -2,
              }}
            >
              <div
                className="cm-w-full cm-h-full cm-rounded-full cm-bg-gradient-to-br cm-from-red-400 cm-to-red-600"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24), inset 0 -1px 1px rgba(0,0,0,0.1)",
                }}
              />
              <div
                className="cm-absolute cm-inset-0 cm-flex cm-items-center cm-justify-center cm-text-xs cm-font-bold cm-text-white"
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
