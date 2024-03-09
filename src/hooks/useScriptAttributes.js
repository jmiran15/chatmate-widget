import { useEffect, useState } from "react";
import { embedderSettings } from "../main";

export default function useGetScriptAttributes() {
  const [settings, setSettings] = useState({
    loaded: false,
  });

  useEffect(() => {
    function fetchAttribs() {
      if (!document) return false;
      if (!embedderSettings.settings.embedId)
        throw new Error(
          "[Chatmate Embed Module::Abort] - Invalid script tag setup detected. Missing required embedId parameter for boot!"
        );

      setSettings({
        ...embedderSettings.settings,
        loaded: true,
      });
    }
    fetchAttribs();
  }, [document]);

  return settings;
}
