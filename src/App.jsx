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
import io from "socket.io-client";
import { SocketProvider } from "./providers/socket";
import { API_PATH } from "./utils/constants";

function isBrowser() {
  return typeof window !== "undefined" && window.document;
}

function getWindowLocation() {
  return isBrowser() ? window.location : null;
}

function isUrlMatch(restrictedUrl, currentUrl) {
  const catchall = restrictedUrl.endsWith("*");
  const cleanRestrictedUrl = catchall
    ? restrictedUrl.slice(0, -1)
    : restrictedUrl;

  try {
    const restrictedUrlObj = new URL(cleanRestrictedUrl);

    const normalizedRestrictedPath = restrictedUrlObj.pathname.replace(
      /\/$/,
      ""
    );
    const normalizedCurrentPath = currentUrl.pathname.replace(/\/$/, "");

    if (catchall) {
      // If catchall is true, check if currentUrl starts with restrictedUrl
      return (
        currentUrl.origin === restrictedUrlObj.origin &&
        normalizedCurrentPath.startsWith(normalizedRestrictedPath)
      );
    } else {
      // If catchall is false, check for exact match
      return (
        currentUrl.origin === restrictedUrlObj.origin &&
        normalizedCurrentPath === normalizedRestrictedPath
      );
    }
  } catch (error) {
    // If there's a problem parsing the URL, return false
    return false;
  }
}

export default function App({ embedId }) {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const sessionId = useSessionId(embedId);
  const chatbot = useChatbot(embedId);
  const isMobile = useMobileScreen();
  const [urlData, setUrlData] = useState({});

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
  const [isRestricted, setIsRestricted] = useState(false);
  const [socket, setSocket] = useState();

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
          setUrlData(url);
        } catch (error) {
          console.error("Error parsing URL:", error);
        }
      }
    };

    parseUrl();

    // Set up an event listener for URL changes
    const handleUrlChange = () => {
      parseUrl();
    };

    window.addEventListener("popstate", handleUrlChange);

    // Clean up the event listener
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [embedId]);

  useEffect(() => {
    if (chatbot?.widgetRestrictedUrls && urlData.href) {
      const restricted = Array.from(chatbot.widgetRestrictedUrls).some(
        (restrictedUrl) => isUrlMatch(restrictedUrl, urlData)
      );
      setIsRestricted(restricted);
    }
  }, [urlData, chatbot?.widgetRestrictedUrls]);

  const handleDismiss = () => {
    if (!window || !embedId) return;

    // console.log(`Dismissing previews`);
    const STORAGE_IDENTIFIER = `chatmate_${embedId}_previews_dismissed`;
    window.localStorage.setItem(STORAGE_IDENTIFIER, "true");
    // console.log(`Marking previews as dismissed`);

    setDismissedStarterPreviews(true);
  };

  useEffect(() => {
    const socket = io(API_PATH);
    setSocket(socket);
    return () => {
      socket.emit("widgetConnected", { sessionId, connected: false });
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("confirmation", (data) => {
      console.log(data);
    });

    socket.on("pollingWidgetStatus", (data) => {
      if (data?.sessionId === sessionId) {
        console.log("pollingWidgetStatus: ", data);
        socket.emit("widgetConnected", { sessionId, connected: true });
      }
    });

    // emit widget connected
    socket.emit("widgetConnected", { sessionId, connected: true });
  }, [socket, sessionId]);

  if (!embedId || !chatbot || isRestricted) return null;

  console.log("socket: ", socket);

  return (
    <SocketProvider socket={socket}>
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
    </SocketProvider>
  );
}
