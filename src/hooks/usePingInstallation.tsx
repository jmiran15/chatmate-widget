import { useEffect } from "react";
import { API_PATH } from "../utils/constants";
import { Chatbot } from "../utils/types";

interface InstallationData {
  lastPingedAt: Date;
  embeddedOn: string;
}

export function usePingInstallation(chatbot: Chatbot | null) {
  useEffect(() => {
    if (!chatbot || chatbot.installed) {
      return;
    }

    const updateInstallationStatus = async () => {
      const currentUrl = window.location.href;
      const currentDate = new Date();

      const installationData: InstallationData = {
        lastPingedAt: currentDate,
        embeddedOn: currentUrl,
      };

      try {
        const response = await fetch(
          `${API_PATH}/api/${chatbot.id}/installed`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(installationData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update installation status");
        }

        const { chatbot: updatedChatbot } = await response.json();
        console.log("Installation status updated:", updatedChatbot);
      } catch (error) {
        console.error("Error updating installation status:", error);
      }
    };

    updateInstallationStatus();
  }, [chatbot]);
}
