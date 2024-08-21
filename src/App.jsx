import Head from "@/components/Head";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import io from "socket.io-client";
import ChatWindow from "./components/chat-window";
import { ElapsedTimeDisplay } from "./components/ElapsedTimeDisplay";
import OpenButton from "./components/open-button";
import PendingMessages from "./components/pending-messages";
import useChat from "./hooks/use-chat";
import useChatbot from "./hooks/use-chatbot";
import { usePingInstallation } from "./hooks/use-ping-installation";
import useSessionId from "./hooks/use-session";
import useOpenChat from "./hooks/useOpenChat";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { SocketProvider } from "./providers/socket";
import { API_PATH } from "./utils/constants";
import { useMobileScreen } from "./utils/mobile";

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
    const restrictedUrlObj = new URL(cleanRestrictedUrl, currentUrl.origin);

    const normalizedRestrictedPath = restrictedUrlObj.pathname.replace(
      /\/$/,
      ""
    );
    const normalizedCurrentPath = currentUrl.pathname.replace(/\/$/, "");

    // console.log({
    //   restriction: normalizedRestrictedPath,
    //   current: normalizedCurrentPath,
    // });

    if (catchall) {
      // check if currentUrl starts with restrictedUrl

      return (
        currentUrl.origin === restrictedUrlObj.origin &&
        normalizedCurrentPath.startsWith(normalizedRestrictedPath)
      );
    } else {
      // check for exact match
      return (
        currentUrl.origin === restrictedUrlObj.origin &&
        normalizedCurrentPath === normalizedRestrictedPath
      );
    }
  } catch (error) {
    return false;
  }
}

export default function App({ embedId }) {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const sessionId = useSessionId(embedId);
  const chatbot = useChatbot(embedId);
  const isMobile = useMobileScreen();
  const [urlData, setUrlData] = useState({});
  const {
    pending,
    setPending,
    chatHistory,
    setChatHistory,
    loading,
    chat,
    resetSession,
  } = useChat({
    chatbot,
    sessionId,
  });
  const { activeTime, handleUserActivity } = useTimeTracking({
    isChatOpen,
    sessionId,
    embedId,
  });

  usePingInstallation(chatbot);

  const [showStarterPreviews, setShowStarterPreviews] = useState(false);
  const [dismissedStarterPreviews, setDismissedStarterPreviews] =
    useState(false);
  const [pendingStarterMessages, setPendingStarterMessages] = useState([]);
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
          flushSync(() => {
            setUrlData(url);
          });
        } catch (error) {
          console.error("Error parsing URL:", error);
        }
      }
    };

    const handleUrlNavigation = (event) => {
      try {
        const url = new URL(event.destination.url);
        setUrlData(url);
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    };

    parseUrl();

    // Check if Navigation API is supported
    if (window.navigation) {
      window.navigation.addEventListener("navigate", handleUrlNavigation);
    } else {
      // Fallback for browsers that don't support Navigation API
      (() => {
        let oldPushState = history.pushState;
        history.pushState = function pushState() {
          let ret = oldPushState.apply(this, arguments);
          window.dispatchEvent(new Event("pushstate"));
          window.dispatchEvent(new Event("locationchange"));
          return ret;
        };

        let oldReplaceState = history.replaceState;
        history.replaceState = function replaceState() {
          let ret = oldReplaceState.apply(this, arguments);
          window.dispatchEvent(new Event("replacestate"));
          window.dispatchEvent(new Event("locationchange"));
          return ret;
        };

        window.addEventListener("popstate", () => {
          window.dispatchEvent(new Event("locationchange"));
        });
      })();

      window.addEventListener("locationchange", parseUrl);
    }

    // Cleanup function
    return () => {
      if (window.navigation) {
        window.navigation.removeEventListener("navigate", handleUrlNavigation);
      } else {
        window.removeEventListener("locationchange", parseUrl);
      }
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
        socket.emit("widgetConnected", { sessionId, connected: true });
      }
    });

    // emit widget connected
    socket.emit("widgetConnected", { sessionId, connected: true });
  }, [socket, sessionId]);

  if (!embedId || !chatbot || isRestricted) return null;

  return (
    <SocketProvider socket={socket}>
      <Head />
      <div>
        {/* only in dev */}
        <ElapsedTimeDisplay activeTime={activeTime} />

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
            handleUserActivity={handleUserActivity}
            resetSession={resetSession}
          />
        )}
        {(!isMobile || !isChatOpen) && (
          <>
            {!isChatOpen && delayedShow && (
              <PendingMessages
                chatbot={chatbot}
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
