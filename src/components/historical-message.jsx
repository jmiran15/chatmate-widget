import React, { useState, useEffect, useCallback } from "react";
import { Warning } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/markdown";
import createDOMPurify from "dompurify";
import { API_PATH, colors } from "../utils/constants";
import MessageDateTooltip from "./message-date-tooltip";
import { AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const DOMPurify = createDOMPurify(window);

const HistoricalMessage = React.memo(
  ({
    msgId,
    message,
    role,
    sources = [],
    error = false,
    chatbot,
    createdAt,
    seen,
    setPending,
    setChatHistory,
  }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [ref, inView] = useInView({
      threshold: 0.5,
      triggerOnce: true,
    });

    const markAsSeen = useCallback(async () => {
      if (!seen && msgId) {
        try {
          await fetch(`${API_PATH}/api/seen/${msgId}`, { method: "POST" });
          return true;
        } catch (error) {
          console.error("Error marking message as seen:", error);
          return false;
        }
      }
      return false;
    }, [msgId, seen]);

    useEffect(() => {
      if (inView && !seen) {
        markAsSeen().then((wasMarked) => {
          if (wasMarked) {
            setPending((prevCount) => {
              const newVal = Math.max(0, prevCount - 1);
              return newVal;
            });
            setChatHistory((prevHistory) =>
              prevHistory.map((msg) => {
                if (msg.id === msgId) {
                  const newMessage = { ...msg, seen: true };
                  return newMessage;
                }
                return msg;
              })
            );
          }
        });
      }
    }, [inView, markAsSeen, seen, setPending]);

    return (
      <div
        key={msgId}
        ref={ref}
        className={`w-auto max-w-[75%] h-fit py-[17px] px-[20px] relative inline-block rounded-[10px] mb-[16px] ${
          error
            ? "bg-red-200"
            : role === "user"
              ? `bg-${colors[chatbot.themeColor]} text-white ml-auto`
              : "bg-[#f2f2f2] text-black"
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AnimatePresence>
          {showTooltip && <MessageDateTooltip date={createdAt} />}
        </AnimatePresence>
        {error ? (
          <div className="p-2 rounded-lg bg-red-50 text-red-500">
            <span className="inline-block">
              <Warning className="h-4 w-4 mb-1 inline-block" /> Could not
              respond to message.
            </span>
            <p className="text-xs font-mono mt-2 border-l-2 border-red-500 pl-2 bg-red-300 p-2 rounded-sm">
              {error}
            </p>
          </div>
        ) : (
          <span
            className="whitespace-normal break-words flex flex-col gap-y-1 text-[14px] leading-[1.4] min-h-[10px]"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(renderMarkdown(message)),
            }}
          />
        )}
      </div>
    );
  }
);

export default HistoricalMessage;
