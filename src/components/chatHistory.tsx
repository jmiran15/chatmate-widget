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
import { RenderableMessage } from "../hooks/useSession";
import { useSessionContext } from "../providers/session";
import { useSocket } from "../providers/socket";
import { Message } from "../utils/types";
import HistoricalMessage from "./historicalMessage";
import PromptReply from "./promptReply";

type MessagesEvent = {
  chatId: string;
  messages: Message[];
};

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
  const { chat, sessionId, messages, setMessages } = useSessionContext();
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
  }, [messages, followUps, isAtBottom, scrollToBottom, scrollToLastFollowUp]);

  const renderMessages = () => {
    let lastMessageDate: Date | null = null;

    return messages.map((props: RenderableMessage, index) => {
      const isLastMessage = index === messages.length - 1;
      const isLastBotReply = isLastMessage && props.role === "assistant";
      const currentMessageDate = safeParseDate(props.createdAt ?? "");

      let dateSeparator: React.ReactNode = null;
      if (
        currentMessageDate &&
        (!lastMessageDate || !isSameDay(lastMessageDate, currentMessageDate))
      ) {
        dateSeparator = (
          <DateSeparator
            key={`date-${props.createdAt}`}
            date={props.createdAt ?? ""}
          />
        );
        lastMessageDate = currentMessageDate;
      }

      const messageComponent =
        isLastBotReply && props.loading ? (
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

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleThread = (data: MessagesEvent) => {
      if (chat.id === data.chatId) {
        setMessages(
          data.messages.map((message: Message) => ({
            ...message,
            streaming: false,
          }))
        );
      }
    };

    socket.on("messages", handleThread);

    return () => {
      socket.off("messages", handleThread);
    };
  }, [socket, chat]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("messages", { chatId: chat.id, messages });
  }, [socket, chat, messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full max-h-[82vh] pb-[100px] pt-[5px] bg-gray-100 rounded-lg px-2 mt-2 gap-y-2 overflow-y-scroll flex flex-col justify-start no-scroll">
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-slate-400 text-sm font-base py-4 text-center">
            Send a chat to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      <div
        className="flex flex-col flex-1 overflow-auto overflow-x-hidden relative overscroll-none pb-[4px] px-[24px] pt-[24px] bg-white"
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
              className="flex flex-col items-end space-y-2 mb-4"
            >
              {followUps.map((followUp, i) => (
                <motion.form
                  key={i}
                  onSubmit={handleSubmit}
                  className="border border-input bg-white hover:bg-[#f2f2f2] rounded-[10px] relative px-3 py-2 w-auto max-w-[75%] h-fit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <button
                    ref={i === followUps.length - 1 ? lastFollowUpRef : null}
                    type="submit"
                    className="text-left whitespace-normal break-words flex flex-col gap-y-1 text-black text-sm select-text"
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
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-600 rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-200"
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
    <div className="h-full w-full relative">
      <div className="h-full max-h-[82vh] pb-[100px] pt-[5px] bg-gray-100 rounded-lg px-2 h-full mt-2 gap-y-2 overflow-y-scroll flex flex-col justify-start no-scroll">
        <div className="flex h-full flex-col items-center justify-center">
          <CircleNotch size={14} className="text-slate-400 animate-spin" />
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
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
        {formattedDate}
      </div>
    </div>
  );
};
