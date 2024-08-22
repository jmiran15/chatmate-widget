import { useCallback, useEffect, useRef, useState } from "react";
import { API_PATH } from "../utils/constants";

interface ActiveTimePayload {
  sessionId: string;
  embedId: string;
  activeTime: number;
  timestamp: string;
}

export function useTimeTracking({
  isChatOpen,
  sessionId,
  embedId,
  initialActiveTime = 0,
}: {
  isChatOpen: boolean;
  sessionId: string;
  embedId: string;
  initialActiveTime?: number;
}) {
  const [activeTime, setActiveTime] = useState<number>(initialActiveTime);
  const [isActive, setIsActive] = useState<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveTime(initialActiveTime);
  }, [initialActiveTime]);

  const startTracking = useCallback(() => {
    setIsActive(true);
    startTimeRef.current = Date.now();
  }, []);

  const stopTracking = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      if (startTimeRef.current) {
        const endTime = Date.now();
        const duration = endTime - startTimeRef.current;
        setActiveTime((prevTime) => prevTime + duration);
        startTimeRef.current = null;
      }
      sendActiveTimeToServer();
    }
  }, [isActive]);

  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(stopTracking, 60000);
  }, [stopTracking]);

  const sendActiveTimeToServer = useCallback(async () => {
    if (activeTime > 0) {
      try {
        const response = await fetch(`${API_PATH}/api/track-active-time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            embedId,
            activeTime: Math.round(activeTime),
            timestamp: new Date().toISOString(),
          } as ActiveTimePayload),
        });
        if (!response.ok) {
          throw new Error("Failed to send active time data");
        }
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
      }
    }
  }, [activeTime, sessionId, embedId]);

  useEffect(() => {
    if (isChatOpen) {
      const syncFailedAttempts = async () => {
        const failedAttempts = JSON.parse(
          localStorage.getItem(`chatmate_${embedId}_failed_time_sync`) || "[]"
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
                } as ActiveTimePayload),
              });

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
        }
      };
      syncFailedAttempts();
    }
  }, [isChatOpen, sessionId, embedId]);

  useEffect(() => {
    if (isChatOpen) {
      startTracking();
    } else {
      stopTracking();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTracking();
      } else if (isChatOpen) {
        startTracking();
      }
    };

    const handleFocus = () => {
      if (isChatOpen) startTracking();
    };

    const handleBlur = () => {
      stopTracking();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      stopTracking();
    };
  }, [isChatOpen, startTracking, stopTracking]);

  useEffect(() => {
    const intervalId = setInterval(sendActiveTimeToServer, 5 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
      sendActiveTimeToServer();
    };
  }, [sendActiveTimeToServer]);

  const handleUserActivity = useCallback(() => {
    if (isChatOpen) {
      resetInactivityTimer();
    }
  }, [isChatOpen, resetInactivityTimer]);

  const sendBeacon = (data: ActiveTimePayload) => {
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
      } as ActiveTimePayload);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeTime, sessionId, embedId]);

  return {
    activeTime,
    handleUserActivity,
  };
}
