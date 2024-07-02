import HistoricalMessage from "./historical-message";
import PromptReply from "./prompt-reply";
import { Fragment, useEffect, useRef, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import debounce from "lodash.debounce";
import { format, isToday, isYesterday, isSameDay, parseISO } from "date-fns";
import { useSocket } from "../providers/socket";

// Helper function to safely parse dates
const safeParseDate = (dateString) => {
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

export default function ChatHistory({
  history = [],
  chatbot,
  followUps,
  submit,
  setMessage,
  setPending,
  setChatHistory,
  sessionId,
}) {
  const replyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatHistoryRef = useRef(null);
  const lastFollowUpRef = useRef(null);

  const scrollToLastFollowUp = () => {
    if (lastFollowUpRef.current) {
      lastFollowUpRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (followUps.length > 0) {
      scrollToLastFollowUp();
    } else {
      scrollToBottom();
    }
  }, [history, followUps.length]);

  const handleScroll = () => {
    if (!chatHistoryRef.current) return;
    const diff =
      chatHistoryRef.current.scrollHeight -
      chatHistoryRef.current.scrollTop -
      chatHistoryRef.current.clientHeight;
    // Fuzzy margin for what qualifies as "bottom". Stronger than straight comparison since that may change over time.
    const isBottom = diff <= 40;
    setIsAtBottom(isBottom);
  };

  const debouncedScroll = debounce(handleScroll, 100);
  useEffect(() => {
    function watchScrollEvent() {
      if (!chatHistoryRef.current) return null;
      const chatHistoryElement = chatHistoryRef.current;
      if (!chatHistoryElement) return null;
      chatHistoryElement.addEventListener("scroll", debouncedScroll);
    }
    watchScrollEvent();
  }, []);

  if (history.length === 0) {
    return (
      <div className="h-full max-h-[82vh] pb-[100px] pt-[5px] bg-gray-100 rounded-lg px-2 h-full mt-2 gap-y-2 overflow-y-scroll flex flex-col justify-start no-scroll">
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-slate-400 text-sm font-base py-4 text-center">
            {"Send a chat to get started!"}
          </p>
        </div>
      </div>
    );
  }

  const renderMessages = () => {
    let lastMessageDate = null;

    return history.map((props, index) => {
      const isLastMessage = index === history.length - 1;
      const isLastBotReply = isLastMessage && props.role === "assistant";
      const currentMessageDate = safeParseDate(props.createdAt);

      let dateSeparator = null;
      if (
        currentMessageDate &&
        (!lastMessageDate || !isSameDay(lastMessageDate, currentMessageDate))
      ) {
        dateSeparator = (
          <DateSeparator
            key={`date-${props.createdAt}`}
            date={props.createdAt}
          />
        );
        lastMessageDate = currentMessageDate;
      }

      const messageComponent =
        isLastBotReply && props.animate ? (
          <PromptReply
            key={props.id || index}
            ref={isLastMessage ? replyRef : null}
            msgId={props.id}
            reply={props.content}
            pending={props.pending}
            sources={props.sources}
            error={props.error}
            closed={props.closed}
            createdAt={props.createdAt}
          />
        ) : (
          <HistoricalMessage
            key={props.id || index}
            msgId={props.id}
            message={props.content}
            role={props.role}
            sources={props.sources}
            chatId={props.chatId}
            feedbackScore={props.feedbackScore}
            error={props.error}
            chatbot={chatbot}
            createdAt={props.createdAt}
            seen={props.seen}
            setPending={setPending}
            setChatHistory={setChatHistory}
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

    const handleThread = (data) => {
      console.log("received data: ", data);
      if (sessionId === data.sessionId) {
        console.log(`${sessionId} - messagesChanged: `, data.messages);
        setChatHistory(data.messages);
      }
    };

    socket.on("messages", handleThread);

    return () => {
      socket.off("messages", handleThread);
    };
  }, [socket, sessionId]);

  useEffect(() => {
    // emit "messages" send entire history
    if (!socket) return;

    console.log("emitting; ", { sessionId, messages: history });
    socket.emit("messages", { sessionId, messages: history });
  }, [socket, sessionId, history]);

  return (
    <div
      className="flex flex-col flex-1 overflow-auto overflow-x-hidden relative overscroll-none pb-[4px] px-[24px] pt-[24px] bg-white"
      id="chat-history"
      ref={chatHistoryRef}
    >
      {renderMessages()}
      {/* followUps */}
      {followUps.length > 0 ? (
        followUps.map((followUp, i) => {
          const isLastFollowUp = i === followUps.length - 1;

          return (
            <form
              key={i}
              onSubmit={submit}
              className="mb-[16px] border border-input bg-white hover:bg-[#f2f2f2] rounded-[10px] relative px-3 py-2 w-auto max-w-[75%] h-fit inline-block ml-auto"
            >
              <button
                ref={isLastFollowUp ? lastFollowUpRef : null}
                type="submit"
                className="text-left whitespace-normal break-words flex flex-col gap-y-1 text-black text-black text-sm select-text"
                onClick={() => {
                  setMessage(followUp);
                }}
              >
                {followUp}
              </button>
            </form>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
}

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

const DateSeparator = ({ date }) => {
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
