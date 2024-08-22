import { useEffect } from "react";
import type { Socket } from "socket.io-client";

interface PollingWidgetStatus {
  sessionId: string;
}

export function useWidgetConnection({
  socket,
  sessionId,
}: {
  socket: Socket | undefined;
  sessionId: string;
}) {
  useEffect(() => {
    if (!socket) return;

    const handleConfirmation = (data: any) => {
      console.log(data);
    };

    const handlePollingWidgetStatus = (data: PollingWidgetStatus) => {
      if (data?.sessionId === sessionId) {
        socket.emit("widgetConnected", { sessionId, connected: true });
      }
    };

    socket.on("confirmation", handleConfirmation);
    socket.on("pollingWidgetStatus", handlePollingWidgetStatus);

    socket.emit("widgetConnected", { sessionId, connected: true });

    return () => {
      socket.off("confirmation", handleConfirmation);
      socket.off("pollingWidgetStatus", handlePollingWidgetStatus);
      socket.emit("widgetConnected", { sessionId, connected: false });
    };
  }, [socket, sessionId]);
}
