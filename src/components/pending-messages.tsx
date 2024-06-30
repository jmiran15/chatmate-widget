import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Message } from "src/utils/types";

const PendingMessages = ({
  starterMessages,
  openChat,
  dismissPreviews,
}: {
  starterMessages: Message[]; // should be Message[] instead
  openChat: () => void;
  dismissPreviews: () => void;
}) => {
  // TODO - should this be in local storage?
  const [showPreviews, setShowPreviews] = useState(true);

  if (!showPreviews || starterMessages?.length === 0) {
    return null;
  }

  const visiblePreviews = starterMessages.slice(0, 2);
  const remainingCount = Math.max(0, starterMessages.length - 2);

  const handleDismiss = () => {
    setShowPreviews(false);
    dismissPreviews();
  };

  return (
    <div className="fixed bottom-[68px] right-[20px] z-[9998] w-[300px]">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        {visiblePreviews.map((message, index) => (
          <div
            key={index}
            className="mb-2 p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            onClick={openChat}
          >
            {message.content}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className="text-sm text-blue-600 cursor-pointer hover:underline"
            onClick={openChat}
          >
            View {remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingMessages;
