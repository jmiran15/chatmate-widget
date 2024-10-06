import { ArrowDown, CircleNotch } from "@phosphor-icons/react";
import { format, isSameDay, isToday, isYesterday, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash/debounce";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSessionContext } from "../providers/session";
import { Message } from "../utils/types";
import HistoricalMessage from "./historicalMessage";
import PromptReply from "./promptReply";

// Helper function to safely parse dates
const safeParseDate = (dateString: string) => {
  if (!dateString) return null;

  try {
    // First, try to parse ISO format
    return parseISO(dateString);
  } catch (error) {
    // If ISO parsing fails, try creating a new Date object
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
};

const ChatHistory: React.FC<{
  followUps: string[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setMessage: (message: string) => void;
}> = ({ followUps, handleSubmit, setMessage }) => {
  const { messages } = useSessionContext();
  const replyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const lastFollowUpRef = useRef<HTMLButtonElement>(null);

  const scrollToLastFollowUp = useCallback(() => {
    lastFollowUpRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToBottom = useCallback(() => {
    chatHistoryRef.current?.scrollTo({
      top: chatHistoryRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatHistoryRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatHistoryRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight <= 1;
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom);
  }, []);

  const debouncedScroll = useCallback(debounce(handleScroll, 100), [
    handleScroll,
  ]);

  useEffect(() => {
    const chatHistoryElement = chatHistoryRef.current;
    if (chatHistoryElement) {
      chatHistoryElement.addEventListener("scroll", debouncedScroll);
      return () => {
        chatHistoryElement.removeEventListener("scroll", debouncedScroll);
      };
    }
  }, [debouncedScroll]);

  useEffect(() => {
    if (isAtBottom) {
      followUps.length > 0 ? scrollToLastFollowUp() : scrollToBottom();
    } else {
      setShowScrollButton(true);
    }
  }, [
    // messages,
    followUps,
    isAtBottom,
    scrollToBottom,
    scrollToLastFollowUp,
    setShowScrollButton,
  ]);

  const renderMessages = () => {
    let lastMessageDate: Date | null = null;

    return messages.map((props: Message, index) => {
      const isLastMessage = index === messages.length - 1;
      const isLastBotReply = isLastMessage && props.role === "assistant";
      const currentMessageDate = safeParseDate(props.createdAt.toISOString());

      let dateSeparator: React.ReactNode = null;
      if (
        currentMessageDate &&
        (!lastMessageDate || !isSameDay(lastMessageDate, currentMessageDate))
      ) {
        dateSeparator = (
          <DateSeparator
            key={`date-${props.createdAt}`}
            date={props.createdAt.toISOString()}
          />
        );
        lastMessageDate = currentMessageDate;
      }

      const messageComponent =
        (isLastBotReply && props.loading) ||
        (props.isPreview && props.isTyping) ? (
          <PromptReply
            ref={isLastMessage ? replyRef : null}
            message={props}
            chatHistoryRef={chatHistoryRef}
          />
        ) : (
          <HistoricalMessage
            key={props.id || index}
            message={props}
            chatHistoryRef={chatHistoryRef}
          />
        );

      return (
        <Fragment key={props.id || index}>
          {dateSeparator}
          {messageComponent}
        </Fragment>
      );
    });
  };

  if (messages.length === 0) {
    return (
      <div className="cm-h-full cm-max-h-[82vh] cm-pb-[100px] cm-pt-[5px] cm-bg-gray-100 cm-rounded-lg cm-px-2 cm-mt-2 cm-gap-y-2 cm-overflow-y-scroll cm-flex cm-flex-col cm-justify-start cm-no-scroll">
        <div className="cm-flex cm-h-full cm-flex-col cm-items-center cm-justify-center">
          <p className="cm-text-slate-400 cm-text-sm cm-font-base cm-py-4 cm-text-center">
            Send a chat to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-flex cm-flex-col cm-flex-1 cm-overflow-hidden cm-relative">
      <div
        className="cm-flex cm-flex-col cm-flex-1 cm-overflow-auto cm-overflow-x-hidden cm-relative cm-overscroll-none cm-pb-[4px] cm-px-[24px] cm-pt-[24px] cm-bg-white"
        id="chat-history"
        ref={chatHistoryRef}
      >
        <AnimatePresence>
          {renderMessages()}
          {followUps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="cm-flex cm-flex-col cm-items-end cm-space-y-2 cm-mb-4"
            >
              {followUps.map((followUp, i) => (
                <motion.form
                  key={i}
                  onSubmit={handleSubmit}
                  className="cm-border cm-border-input cm-bg-white hover:cm-bg-[#f2f2f2] cm-rounded-[10px] cm-relative cm-px-3 cm-py-2 cm-w-auto cm-max-w-[75%] cm-h-fit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <button
                    ref={i === followUps.length - 1 ? lastFollowUpRef : null}
                    type="submit"
                    className="cm-text-left cm-whitespace-normal cm-break-words cm-flex cm-flex-col cm-gap-y-1 cm-text-black cm-text-sm cm-select-text"
                    onClick={() => setMessage(followUp)}
                  >
                    {followUp}
                  </button>
                </motion.form>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="cm-absolute cm-bottom-4 cm-left-1/2 cm-transform cm--translate-x-1/2 cm-bg-white cm-text-gray-600 cm-rounded-full cm-p-2 cm-shadow-lg hover:cm-bg-gray-100 cm-transition-all cm-duration-200"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            style={{
              boxShadow:
                "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
            }}
          >
            <ArrowDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ChatHistory);

export function ChatHistoryLoading() {
  return (
    <div className="cm-h-full cm-w-full cm-relative">
      <div className="cm-h-full cm-max-h-[82vh] cm-pb-[100px] cm-pt-[5px] cm-bg-gray-100 cm-rounded-lg cm-px-2 cm-mt-2 cm-gap-y-2 cm-overflow-y-scroll cm-flex cm-flex-col cm-justify-start cm-no-scroll">
        <div className="cm-flex cm-h-full cm-flex-col cm-items-center cm-justify-center">
          <CircleNotch
            size={14}
            className="cm-text-slate-400 cm-animate-spin"
          />
        </div>
      </div>
    </div>
  );
}

const DateSeparator = ({ date }: { date: string }) => {
  const parsedDate = safeParseDate(date);

  if (!parsedDate) {
    return null; // Return null if the date is invalid
  }

  const formattedDate = isToday(parsedDate)
    ? "Today"
    : isYesterday(parsedDate)
      ? "Yesterday"
      : format(parsedDate, "MMMM d, yyyy");

  return (
    <div className="cm-flex cm-items-center cm-justify-center cm-my-4">
      <div className="cm-bg-gray-200 cm-text-gray-600 cm-text-xs cm-font-medium cm-px-3 cm-py-1 cm-rounded-full">
        {formattedDate}
      </div>
    </div>
  );
};
