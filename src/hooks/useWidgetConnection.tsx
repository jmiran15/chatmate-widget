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
    // TODO
    // update last seen - maybe send it in the widgetConnected event
    // then on WidgetConnected, update last seen in prisma db
    // in the anon sidebar we check if widget is connected, if not, show the last seen time. If close by, show distance (e.g, 10 seconds ago), if not close by, show last seen time

    return () => {
      socket.off("confirmation", handleConfirmation);
      socket.off("pollingWidgetStatus", handlePollingWidgetStatus);
      socket.emit("widgetConnected", { sessionId, connected: false });
      // update last seen
    };
  }, [socket, sessionId]);
}
