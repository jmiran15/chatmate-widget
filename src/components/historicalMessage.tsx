import { Warning } from "@phosphor-icons/react";
import createDOMPurify from "dompurify";
import { AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { RenderableMessage } from "../hooks/useSession";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { API_PATH, colors } from "../utils/constants";
import renderMarkdown from "../utils/markdown";
import MessageDateTooltip from "./message-date-tooltip";

const DOMPurify = createDOMPurify(window);

const HistoricalMessage = React.memo(
  ({ message }: { message: RenderableMessage }) => {
    const { id, content, role, createdAt, seen, streaming, error } = message;
    const chatbot = useChatbot();
    const { setPendingCount, setMessages } = useSessionContext();
    const [showTooltip, setShowTooltip] = useState(() => false);

    const [ref, inView] = useInView({
      threshold: 0.5,
      triggerOnce: true,
    });

    const markAsSeen = useCallback(async () => {
      if (!seen && id && !streaming) {
        try {
          await fetch(`${API_PATH}/api/seen/${id}`, { method: "POST" });
          return true;
        } catch (error) {
          console.error("Error marking message as seen:", error);
          return false;
        }
      }
      return false;
    }, [id, seen, streaming]);

    useEffect(() => {
      if (inView && !seen) {
        markAsSeen().then((wasMarked) => {
          if (wasMarked) {
            setPendingCount((prevCount: number) => {
              const newVal = Math.max(0, prevCount - 1);
              return newVal;
            });
            setMessages((messages: RenderableMessage[]) =>
              messages.map((msg) => {
                if (msg.id === id) {
                  const newMessage = { ...msg, seen: true };
                  return newMessage;
                }
                return msg;
              })
            );
          }
        });
      }
    }, [inView, markAsSeen, seen, setPendingCount, setMessages]);

    return (
      <div
        key={id}
        ref={ref}
        className={`w-auto max-w-[75%] h-fit py-[17px] px-[20px] relative inline-block rounded-[10px] mb-[16px] ${
          error
            ? "bg-red-200"
            : role === "user"
              ? `bg-${colors[(chatbot?.themeColor ?? "zinc") as keyof typeof colors]} text-white ml-auto`
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
              __html: DOMPurify.sanitize(renderMarkdown(content ?? "")),
            }}
          />
        )}
      </div>
    );
  }
);

export default HistoricalMessage;
