import { useCallback, useEffect, useState } from "react";
import { Chatbot, Message } from "src/utils/types";

export function usePendingMessages({
  chatHistory,
  chatbot,
  embedId,
}: {
  chatHistory: Message[];
  chatbot: Chatbot;
  embedId: string;
}) {
  const [pendingStarterMessages, setPendingStarterMessages] = useState<
    Message[]
  >([]);
  const [dismissedStarterPreviews, setDismissedStarterPreviews] =
    useState(false);
  const [showStarterPreviews, setShowStarterPreviews] = useState(false);
  const [delayedShow, setDelayedShow] = useState(false);

  const findPendingStarterMessages = useCallback(
    ({
      messages,
      introMessages,
    }: {
      messages: Message[];
      introMessages: string[];
    }) => {
      if (!introMessages || !messages.length) return [];
      const starterSet = new Set(introMessages);
      return messages.filter(
        (message, index) =>
          message.role !== "user" &&
          message.content &&
          starterSet.has(message.content) &&
          index < introMessages.length &&
          !message.seen
      );
    },
    [chatHistory, chatbot]
  );

  useEffect(() => {
    function getPreviewsDismissedState() {
      if (!window || !embedId) return;

      const STORAGE_IDENTIFIER = `chatmate_${embedId}_previews_dismissed`;
      const dismissed = window.localStorage.getItem(STORAGE_IDENTIFIER);

      if (!!dismissed) {
        setDismissedStarterPreviews(true);
        return;
      }
      setDismissedStarterPreviews(false);
    }
    getPreviewsDismissedState();
  }, [embedId]);

  useEffect(() => {
    if (!chatHistory || !chatbot) return;

    if (dismissedStarterPreviews) {
      return setShowStarterPreviews(false);
    } else {
      const pendingStarters = findPendingStarterMessages({
        messages: chatHistory,
        introMessages: chatbot.introMessages,
      });
      if (!pendingStarters.length) {
        return setShowStarterPreviews(false);
      }
      setPendingStarterMessages(pendingStarters);
      setShowStarterPreviews(true);
    }
  }, [chatHistory, chatbot, dismissedStarterPreviews]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDelayedShow(showStarterPreviews ? true : false),
      showStarterPreviews ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [showStarterPreviews]);

  const handleDismiss = () => {
    if (!window || !embedId) return;

    const STORAGE_IDENTIFIER = `chatmate_${embedId}_previews_dismissed`;
    window.localStorage.setItem(STORAGE_IDENTIFIER, "true");

    setDismissedStarterPreviews(true);
  };

  return {
    showStarterPreviews,
    handleDismiss,
    pendingStarterMessages,
    delayedShow,
  };
}
