import { Warning } from "@phosphor-icons/react";
import createDOMPurify from "dompurify";
import { AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RenderableMessage } from "../hooks/useSession";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { API_PATH, colors } from "../utils/constants";
import renderMarkdown from "../utils/markdown";
import MessageDateTooltip from "./messageDateTooltip";

const DOMPurify = createDOMPurify(window);

const HistoricalMessage: React.FC<{
  message: RenderableMessage;
  chatHistoryRef: React.RefObject<HTMLDivElement>;
}> = React.memo(({ message, chatHistoryRef }) => {
  const { id, content, role, createdAt, seen, streaming, error } = message;
  const chatbot = useChatbot();
  const { setPendingCount, setMessages } = useSessionContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    chatContainerRef.current = document.getElementById(
      "chat-history",
    ) as HTMLDivElement;
  }, []);

  const markAsSeen = useCallback(async () => {
    if (!seen && id && !streaming && !error && role !== "user") {
      try {
        await fetch(`${API_PATH}/api/seen/${id}`, { method: "POST" });
        return true;
      } catch (error) {
        console.error("Error marking message as seen:", error);
        return false;
      }
    }
    return false;
  }, [id, seen, streaming, error, role]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      },
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && !seen) {
      markAsSeen().then((wasMarked) => {
        if (wasMarked) {
          setPendingCount((prevCount: number) => Math.max(0, prevCount - 1));
          setMessages((messages: RenderableMessage[]) =>
            messages.map((msg) =>
              msg.id === id ? { ...msg, seen: true } : msg,
            ),
          );
        }
      });
    }
  }, [isVisible, seen, markAsSeen, setPendingCount, setMessages, id]);

  const messageClasses = `w-auto max-w-[75%] h-fit py-[17px] px-[20px] relative inline-block rounded-[10px] mb-[16px] ${
    error
      ? "bg-red-200"
      : role === "user"
        ? `bg-${colors[(chatbot?.themeColor ?? "zinc") as keyof typeof colors]} text-white ml-auto`
        : "bg-[#f2f2f2] text-black"
  }`;

  return (
    <div
      ref={messageRef}
      className={messageClasses}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <AnimatePresence>
        {showTooltip && (
          <MessageDateTooltip date={createdAt} parentRef={chatHistoryRef} />
        )}
      </AnimatePresence>
      {error ? (
        <div className="p-2 rounded-lg bg-red-50 text-red-500">
          <span className="inline-block">
            <Warning className="h-4 w-4 mb-1 inline-block" /> Could not respond
            to message.
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
});

export default HistoricalMessage;
