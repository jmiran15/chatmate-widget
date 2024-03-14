import HistoricalMessage from "./historical-message";
import PromptReply from "./prompt-reply";
import { useEffect, useRef, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import debounce from "lodash.debounce";

export default function ChatHistory({ embedId, history = [], chatbot }) {
  const replyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatHistoryRef = useRef(null);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

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

  return (
    <div
      className="flex flex-col flex-1 overflow-auto overflow-x-hidden relative overscroll-none pb-[4px] px-[24px] pt-[24px] bg-white"
      id="chat-history"
      ref={chatHistoryRef}
    >
      {history.map((props, index) => {
        const isLastMessage = index === history.length - 1;
        const isLastBotReply =
          index === history.length - 1 && props.role === "assistant";

        if (isLastBotReply && props.animate) {
          return (
            <PromptReply
              key={props.uuid}
              ref={isLastMessage ? replyRef : null}
              uuid={props.uuid}
              reply={props.content}
              pending={props.pending}
              sources={props.sources}
              error={props.error}
              closed={props.closed}
            />
          );
        }

        return (
          <HistoricalMessage
            key={index}
            ref={isLastMessage ? replyRef : null}
            message={props.content}
            role={props.role}
            sources={props.sources}
            chatId={props.chatId}
            feedbackScore={props.feedbackScore}
            error={props.error}
            chatbot={chatbot}
          />
        );
      })}
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
