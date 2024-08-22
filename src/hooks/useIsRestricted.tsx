import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Chatbot } from "../utils/types";

function isBrowser() {
  return typeof window !== "undefined" && window.document;
}

function getWindowLocation() {
  return isBrowser() ? window.location : null;
}

function isUrlMatch({
  restrictedUrl,
  currentUrl,
}: {
  restrictedUrl: string;
  currentUrl: URL;
}) {
  const catchall = restrictedUrl.endsWith("*");
  const cleanRestrictedUrl = catchall
    ? restrictedUrl.slice(0, -1)
    : restrictedUrl;

  try {
    const restrictedUrlObj = new URL(cleanRestrictedUrl, currentUrl.origin);

    const normalizedRestrictedPath = restrictedUrlObj.pathname.replace(
      /\/$/,
      "",
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

export function useIsRestricted({ chatbot }: { chatbot: Chatbot | null }) {
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [urlData, setUrlData] = useState<URL | null>(null);

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

    const handleUrlNavigation = (event: { destination: { url: string } }) => {
      try {
        const url = new URL(event.destination.url);
        flushSync(() => {
          setUrlData(url);
        });
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    };

    parseUrl();

    // Check if Navigation API is supported
    if ("navigation" in window && window.navigation) {
      (window.navigation as any).addEventListener(
        "navigate",
        handleUrlNavigation,
      );
    } else {
      // Fallback for browsers that don't support Navigation API
      (() => {
        let oldPushState = history.pushState;
        history.pushState = function pushState(
          ...args: Parameters<typeof oldPushState>
        ) {
          let ret = oldPushState.apply(this, args);
          window.dispatchEvent(new Event("pushstate"));
          window.dispatchEvent(new Event("locationchange"));
          return ret;
        };

        let oldReplaceState = history.replaceState;
        history.replaceState = function replaceState(
          ...args: Parameters<typeof oldReplaceState>
        ) {
          let ret = oldReplaceState.apply(this, args);
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
      if ("navigation" in window && window.navigation) {
        (window.navigation as any).removeEventListener(
          "navigate",
          handleUrlNavigation,
        );
      } else {
        window.removeEventListener("locationchange", parseUrl);
      }
    };
  }, [chatbot]);

  useEffect(() => {
    if (chatbot?.widgetRestrictedUrls && urlData?.href) {
      const restricted = Array.from(
        chatbot.widgetRestrictedUrls as string[],
      ).some((restrictedUrl) =>
        isUrlMatch({ restrictedUrl, currentUrl: urlData }),
      );
      setIsRestricted(restricted);
    }
  }, [urlData, chatbot?.widgetRestrictedUrls]);

  return isRestricted;
}
