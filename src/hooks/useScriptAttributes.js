import { useEffect, useState } from "react";
import { embedderSettings } from "../main";

const DEFAULT_SETTINGS = {
  embedId: null, //required
  baseApiUrl: null, // required

  // base url is not required, we will just fix it

  // we will get all these things from the CHATBOT IN PRISMA when we make the chat call
  // Override properties that can be defined.
  prompt: null, // override
  model: null, // override
  temperature: null, //override

  // have these as parameters (automatically set in the share page, so that we don't need to fetch it from backend at load time)
  // style parameters
  chatIcon: "magic",
  brandImageUrl: null, // will be forced into 100x50px container
  greeting: null, // empty chat window greeting.
  buttonColor: "#262626", // must be hex color code
  userBgColor: "#000", // user text bubble color
  assistantBgColor: "#FFF", // assistant text bubble color
  noSponsor: null, // Shows sponsor in footer of chat
  supportEmail: null, // string of email for contact
  sponsorText: "Powered by Chatmate", // default sponsor text
  sponsorLink: "https://chatmate.fly.dev/", // default sponsor link

  // behaviors
  openOnLoad: "off", // or "on"
};

export default function useGetScriptAttributes() {
  const [settings, setSettings] = useState({
    loaded: false,
    ...DEFAULT_SETTINGS,
  });

  useEffect(() => {
    function fetchAttribs() {
      if (!document) return false;
      if (
        !embedderSettings.settings.baseApiUrl ||
        !embedderSettings.settings.embedId
      )
        throw new Error(
          "[Chatmate Embed Module::Abort] - Invalid script tag setup detected. Missing required parameters for boot!"
        );

      setSettings({
        ...DEFAULT_SETTINGS,
        ...embedderSettings.settings,
        loaded: true,
      });
    }
    fetchAttribs();
  }, [document]);

  return settings;
}
