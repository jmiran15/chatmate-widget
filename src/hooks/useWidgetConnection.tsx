import { useEffect } from "react";
import type { Socket } from "socket.io-client";

interface PollingWidgetStatus {
  sessionId: string;
}

// Change these types - should send some bool indicating wether user is online or not, and then a last active time (use for last seen field)

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
