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
        className="fixed bottom-[88px] z-[9998] max-w-[300px] space-y-2"
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
              className={`absolute -top-2 ${isLeftAligned ? "left-0" : "right-0"} bg-gray-200 rounded-full p-1 shadow-md z-10`}
            >
              <XMarkIcon className="w-4 h-4 text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>
        {visiblePreviews.map((message) => (
          <div
            key={message.id}
            className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer"
            onClick={openChat}
          >
            <div className="line-clamp-2 overflow-hidden text-ellipsis">
              {message.content}
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className={`text-sm text-blue-600 cursor-pointer hover:underline ${isLeftAligned ? "text-left" : "text-right"}`}
            onClick={openChat}
          >
            View {remainingCount} more
          </div>
        )}
      </div>
    );
  },
);

export default PendingMessages;
