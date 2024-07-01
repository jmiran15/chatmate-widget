import useOpenChat from "./hooks/use-open-chat";
import useSessionId from "./hooks/use-session";
import useChatbot from "./hooks/use-chatbot";
import Head from "@/components/Head";
import OpenButton from "./components/open-button";
import ChatWindow from "./components/chat-window";
import { useMobileScreen } from "./utils/mobile";
import useChat from "./hooks/use-chat";
import { useEffect, useState, useCallback } from "react";
import PendingMessages from "./components/pending-messages";

function isBrowser() {
  return typeof window !== "undefined" && window.document;
}

function getWindowLocation() {
  return isBrowser() ? window.location : null;
}

export default function App({ embedId }) {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const sessionId = useSessionId(embedId);
  const chatbot = useChatbot(embedId);
  const isMobile = useMobileScreen();
  const [urlData, setUrlData] = useState({
    full: "",
    protocol: "",
    host: "",
    pathname: "",
    search: "",
    hash: "",
  });
  const [showStarterPreviews, setShowStarterPreviews] = useState(false);
  const [dismissedStarterPreviews, setDismissedStarterPreviews] =
    useState(false);
  const [pendingStarterMessages, setPendingStarterMessages] = useState([]);
  const { pending, setPending, chatHistory, setChatHistory, loading } = useChat(
    {
      chatbot,
      sessionId,
    }
  );
  const [delayedShow, setDelayedShow] = useState(false);

  const findPendingStarterMessages = useCallback(
    (messages, introMessages) => {
      if (!introMessages || !messages.length) return [];
      const starterSet = new Set(introMessages);
      return messages.filter(
        (msg, index) =>
          msg.role !== "user" &&
          starterSet.has(msg.content) &&
          index < introMessages.length &&
          !msg.seen
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
        // console.log(`Previews were previously dismissed`);
        setDismissedStarterPreviews(true);
        return;
      }

      // console.log(`Previews were not previously dismissed`);
      setDismissedStarterPreviews(false);
    }
    getPreviewsDismissedState();
  }, [embedId]);

  useEffect(() => {
    if (!chatHistory || !chatbot) return;

    if (dismissedStarterPreviews) {
      // console.log(`Previews were previously dismissed, not showing`);
      setShowStarterPreviews(false);
      return;
    } else {
      // console.log(`Previews were not previously dismissed, showing`);
      const pendingStarters = findPendingStarterMessages(
        chatHistory,
        chatbot.introMessages
      );
      if (!pendingStarters.length) {
        // console.log(`No pending starters found`);
        setShowStarterPreviews(false);
        return;
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

  useEffect(() => {
    const parseUrl = () => {
      const location = getWindowLocation();
      if (location) {
        try {
          const url = new URL(location.href);
          setUrlData({
            full: url.href,
            protocol: url.protocol.replace(":", ""),
            host: url.host,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash,
          });
        } catch (error) {
          console.error("Error parsing URL:", error);
        }
      }
    };

    parseUrl();
  }, [embedId]);

  const handleDismiss = () => {
    if (!window || !embedId) return;

    // console.log(`Dismissing previews`);
    const STORAGE_IDENTIFIER = `chatmate_${embedId}_previews_dismissed`;
    window.localStorage.setItem(STORAGE_IDENTIFIER, "true");
    // console.log(`Marking previews as dismissed`);

    setDismissedStarterPreviews(true);
  };

  if (!embedId || !chatbot) return null;

  console.log("App.jsx - current url", urlData);

  return (
    <>
      <Head />
      <div>
        {isChatOpen && (
          <ChatWindow
            closeChat={() => toggleOpenChat(false)}
            embedId={embedId}
            sessionId={sessionId}
            chatbot={chatbot}
            chatbotId={embedId}
            setPending={setPending}
            setChatHistory={setChatHistory}
            chatHistory={chatHistory}
            loading={loading}
          />
        )}
        {(!isMobile || !isChatOpen) && (
          <>
            {!isChatOpen && delayedShow && (
              <PendingMessages
                starterMessages={pendingStarterMessages}
                openChat={() => toggleOpenChat(true)}
                handleDismiss={handleDismiss}
              />
            )}
            <OpenButton
              embedId={embedId}
              isOpen={isChatOpen}
              toggleOpen={() => toggleOpenChat(!isChatOpen)}
              chatbot={chatbot}
              pending={showStarterPreviews ? 0 : pending}
            />
          </>
        )}
      </div>
    </>
  );
}
