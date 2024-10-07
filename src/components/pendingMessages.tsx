import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { Chatbot, Message } from "../utils/types";

const PendingMessages = React.memo(
  ({
    starterMessages,
    openChat,
    handleDismiss,
    chatbot,
  }: {
    starterMessages: Message[];
    openChat: () => void;
    handleDismiss: () => void;
    chatbot: Chatbot;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    if (starterMessages.length === 0) {
      return null;
    }

    const isLeftAligned = chatbot.widgetPosition === "BOTTOM_LEFT";
    const visiblePreviews = starterMessages.slice(0, 2);
    const remainingCount = Math.max(0, starterMessages.length - 2);

    return (
      <div
        className="cm-fixed cm-bottom-[88px] cm-z-[9999] cm-max-w-[300px] cm-space-y-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          [isLeftAligned ? "left" : "right"]: "20px",
        }}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className={`cm-absolute cm--top-2 ${isLeftAligned ? "cm-left-0" : "cm-right-0"} cm-bg-gray-200 cm-rounded-full cm-p-1 cm-shadow-md cm-z-[9999]`}
            >
              <XMarkIcon className="cm-w-4 cm-h-4 cm-text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>
        {visiblePreviews.map((message) => (
          <div
            key={message.id}
            className="cm-relative cm-bg-white cm-rounded-lg cm-shadow-md hover:cm-shadow-lg cm-transition-shadow cm-duration-200 cm-p-4 cm-cursor-pointer"
            onClick={openChat}
          >
            <div className="cm-line-clamp-2 cm-overflow-hidden cm-text-ellipsis">
              {message.content}
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className={`cm-text-sm cm-text-blue-600 cm-cursor-pointer hover:cm-underline ${isLeftAligned ? "cm-text-left" : "cm-text-right"}`}
            onClick={openChat}
          >
            View {remainingCount} more
          </div>
        )}
      </div>
    );
  }
);

export default PendingMessages;
