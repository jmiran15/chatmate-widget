import useOpenChat from "./hooks/use-open-chat";
import useSessionId from "./hooks/use-session";
import useChatbot from "./hooks/use-chatbot";
import Head from "@/components/Head";
import OpenButton from "./components/open-button";
import ChatWindow from "./components/chat-window";
import { useMobileScreen } from "./utils/mobile";
import useChat from "./hooks/use-chat";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import PendingMessages from "./components/pending-messages";
import io from "socket.io-client";
import { SocketProvider } from "./providers/socket";
import { API_PATH } from "./utils/constants";
import { flushSync } from "react-dom";
import { formatDuration, intervalToDuration } from "date-fns";
import { usePingInstallation } from "./hooks/use-ping-installation";

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

  const [activeTime, setActiveTime] = useState(Number(chat?.elapsedMs ?? 0));
  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);
  usePingInstallation(chatbot);

  const startTracking = useCallback(() => {
    setIsActive(true);
    startTimeRef.current = Date.now();
  }, []);

  const stopTracking = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      const endTime = Date.now();
      const duration = endTime - (startTimeRef.current || endTime);
      setActiveTime((prevTime) => prevTime + duration);
      startTimeRef.current = null;
      sendActiveTimeToServer();
    }
  }, [isActive]);

  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(stopTracking, 60000);
  }, [stopTracking]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const [showStarterPreviews, setShowStarterPreviews] = useState(false);
  const [dismissedStarterPreviews, setDismissedStarterPreviews] =
    useState(false);
  const [pendingStarterMessages, setPendingStarterMessages] = useState([]);
  const [delayedShow, setDelayedShow] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [socket, setSocket] = useState();

  useEffect(() => {
    console.log(`[TimeTracking] Chat open state changed: ${isChatOpen}`);
    if (isChatOpen) {
      console.log("[TimeTracking] Starting tracking");
      startTracking();
    } else {
      console.log("[TimeTracking] Stopping tracking");
      stopTracking();
    }

    const handleVisibilityChange = () => {
      console.log(
        `[TimeTracking] Visibility changed: ${document.hidden ? "hidden" : "visible"}`
      );
      if (document.hidden) {
        stopTracking();
      } else if (isChatOpen) {
        startTracking();
      }
    };

    const handleFocus = () => {
      console.log("[TimeTracking] Window focused");
      if (isChatOpen) startTracking();
    };

    const handleBlur = () => {
      console.log("[TimeTracking] Window blurred");
      stopTracking();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      console.log("[TimeTracking] Cleanup: Stopping tracking");
      stopTracking();
    };
  }, [isChatOpen, startTracking, stopTracking]);

  // Function to send active time to server
  const sendActiveTimeToServer = useCallback(async () => {
    if (activeTime > 0) {
      console.log(
        `[TimeTracking] Sending active time to server: ${Math.round(activeTime)} seconds`
      );
      try {
        const response = await fetch(`${API_PATH}/api/track-active-time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            embedId,
            activeTime: Math.round(activeTime), // Convert to nearest second
            timestamp: new Date().toISOString(),
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to send active time data");
        }
        console.log("[TimeTracking] Successfully sent active time to server");
      } catch (error) {
        console.error("Error sending active time data:", error);
        // Store failed attempt locally
        const failedAttempts = JSON.parse(
          localStorage.getItem(`chatmate_${embedId}_failed_time_sync`) || "[]"
        );
        failedAttempts.push({
          activeTime: Math.round(activeTime),
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(
          `chatmate_${embedId}_failed_time_sync`,
          JSON.stringify(failedAttempts)
        );
        console.log("[TimeTracking] Stored failed attempt locally");
      }
    }
  }, [activeTime, sessionId, embedId]);

  // Send active time to server every 5 minutes and when the component unmounts
  useEffect(() => {
    console.log("[TimeTracking] Setting up interval for sending active time");
    const intervalId = setInterval(
      () => {
        console.log("[TimeTracking] Interval triggered: Sending active time");
        sendActiveTimeToServer();
      },
      5 * 60 * 1000
    );
    return () => {
      console.log(
        "[TimeTracking] Cleanup: Clearing interval and sending final active time"
      );
      clearInterval(intervalId);
      sendActiveTimeToServer();
    };
  }, [sendActiveTimeToServer]);

  // Sync failed attempts when the chat is opened
  useEffect(() => {
    if (isChatOpen) {
      console.log("[TimeTracking] Chat opened: Syncing failed attempts");
      const syncFailedAttempts = async () => {
        const failedAttempts = JSON.parse(
          localStorage.getItem(`chatmate_${embedId}_failed_time_sync`) || "[]"
        );
        console.log(
          `[TimeTracking] Found ${failedAttempts.length} failed attempts`
        );
        if (failedAttempts.length > 0) {
          for (const attempt of failedAttempts) {
            try {
              await fetch(`${API_PATH}/api/track-active-time`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sessionId,
                  embedId,
                  activeTime: attempt.activeTime,
                  timestamp: attempt.timestamp,
                }),
              });
              console.log(
                "[TimeTracking] Successfully synced a failed attempt"
              );
              failedAttempts.shift();
            } catch (error) {
              console.error("Error syncing failed attempt:", error);
              break;
            }
          }
          localStorage.setItem(
            `chatmate_${embedId}_failed_time_sync`,
            JSON.stringify(failedAttempts)
          );
          console.log(
            `[TimeTracking] Updated failed attempts in local storage. Remaining: ${failedAttempts.length}`
          );
        }
      };
      syncFailedAttempts();
    }
  }, [isChatOpen, sessionId, embedId]);

  const sendBeacon = (data) => {
    navigator.sendBeacon(
      `${API_PATH}/api/track-active-time`,
      JSON.stringify(data)
    );
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      sendBeacon({
        sessionId,
        embedId,
        activeTime: Math.round(activeTime),
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeTime, sessionId, embedId]);

  // Memoized function to handle user activity
  const handleUserActivity = useMemo(() => {
    return () => {
      if (isChatOpen) {
        console.log(
          "[TimeTracking] User activity detected: Resetting inactivity timer"
        );
        resetInactivityTimer();
      }
    };
  }, [isChatOpen, resetInactivityTimer]);

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
        {/* <ElapsedTimeDisplay activeTime={activeTime} /> */}

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

const ElapsedTimeDisplay = ({ activeTime }) => {
  const duration = intervalToDuration({ start: 0, end: activeTime });
  const formattedDuration = formatDuration(duration, {
    format: ["hours", "minutes", "seconds"],
    zero: true,
    delimiter: ":",
    padding: true,
  });

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        color: "red",
        fontSize: "24px",
        fontWeight: "bold",
        textShadow: "1px 1px 2px black",
      }}
    >
      {formattedDuration}
    </div>
  );
};
