import { CircleNotch } from "@phosphor-icons/react";
import { format, isSameDay, isToday, isYesterday, parseISO } from "date-fns";
import debounce from "lodash/debounce";
import { Fragment, useEffect, useRef, useState } from "react";
import { RenderableMessage } from "../hooks/useSession";
import { useSessionContext } from "../providers/session";
import { useSocket } from "../providers/socket";
import { Message } from "../utils/types";
import HistoricalMessage from "./historicalMessage";
import PromptReply from "./promptReply";

type MessagesEvent = {
  sessionId: string;
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

export default function ChatHistory({
  followUps,
  handleSubmit,
  setMessage,
}: {
  followUps: string[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setMessage: (message: string) => void;
}) {
  const { sessionId, messages, setMessages } = useSessionContext();
  const replyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const lastFollowUpRef = useRef<HTMLButtonElement>(null);

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
  }, [messages, followUps.length]);

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

  if (messages.length === 0) {
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
          <PromptReply ref={isLastMessage ? replyRef : null} message={props} />
        ) : (
          <HistoricalMessage key={props.id || index} message={props} />
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
      if (sessionId === data.sessionId) {
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
  }, [socket, sessionId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("messages", { sessionId, messages });
  }, [socket, sessionId, messages]);

  return (
    <div
      className="flex flex-col flex-1 overflow-auto overflow-x-hidden relative overscroll-none pb-[4px] px-[24px] pt-[24px] bg-white"
      id="chat-history"
      ref={chatHistoryRef}
    >
      {renderMessages()}
      {/* followUps - turn into it's own component*/}

      {followUps.length > 0 ? (
        followUps.map((followUp, i) => {
          const isLastFollowUp = i === followUps.length - 1;

          return (
            <form
              key={i}
              onSubmit={handleSubmit}
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

// import { ArrowDown, CircleNotch } from "@phosphor-icons/react";
// import { format, isSameDay, isToday, isYesterday, parseISO } from "date-fns";
// import debounce from "lodash/debounce";
// import { Fragment, useCallback, useEffect, useRef, useState } from "react";
// import { RenderableMessage } from "../hooks/useSession";
// import { useSessionContext } from "../providers/session";
// import { useSocket } from "../providers/socket";
// import { Message } from "../utils/types";
// import HistoricalMessage from "./historicalMessage";
// import PromptReply from "./promptReply";

// type MessagesEvent = {
//   sessionId: string;
//   messages: Message[];
// };

// // Helper function to safely parse dates
// const safeParseDate = (dateString: string) => {
//   if (!dateString) return null;

//   try {
//     // First, try to parse ISO format
//     return parseISO(dateString);
//   } catch (error) {
//     // If ISO parsing fails, try creating a new Date object
//     const date = new Date(dateString);
//     return isNaN(date.getTime()) ? null : date;
//   }
// };

// export default function ChatHistory({
//   followUps,
//   handleSubmit,
//   setMessage,
// }: {
//   followUps: string[];
//   handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
//   setMessage: (message: string) => void;
// }) {
//   const { sessionId, messages, setMessages } = useSessionContext();
//   const replyRef = useRef(null);
//   const [isAtBottom, setIsAtBottom] = useState(true);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const chatHistoryRef = useRef<HTMLDivElement>(null);
//   const lastFollowUpRef = useRef<HTMLButtonElement>(null);

//   const scrollToLastFollowUp = useCallback(() => {
//     if (lastFollowUpRef.current) {
//       lastFollowUpRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, []);

//   const scrollToBottom = useCallback(() => {
//     if (chatHistoryRef.current) {
//       chatHistoryRef.current.scrollTo({
//         top: chatHistoryRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, []);

//   const handleScroll = useCallback(() => {
//     if (!chatHistoryRef.current) return;
//     const { scrollTop, scrollHeight, clientHeight } = chatHistoryRef.current;
//     const atBottom = scrollHeight - scrollTop - clientHeight <= 1;
//     setIsAtBottom(atBottom);
//     setShowScrollButton(!atBottom);
//   }, []);

//   const debouncedScroll = useCallback(debounce(handleScroll, 100), [
//     handleScroll,
//   ]);

//   useEffect(() => {
//     const chatHistoryElement = chatHistoryRef.current;
//     if (chatHistoryElement) {
//       chatHistoryElement.addEventListener("scroll", debouncedScroll);
//       return () => {
//         chatHistoryElement.removeEventListener("scroll", debouncedScroll);
//       };
//     }
//   }, [debouncedScroll]);

//   useEffect(() => {
//     if (isAtBottom) {
//       if (followUps.length > 0) {
//         scrollToLastFollowUp();
//       } else {
//         scrollToBottom();
//       }
//     } else {
//       setShowScrollButton(true);
//     }
//   }, [messages, followUps, isAtBottom, scrollToBottom, scrollToLastFollowUp]);

//   const renderMessages = () => {
//     let lastMessageDate: Date | null = null;

//     return messages.map((props: RenderableMessage, index) => {
//       const isLastMessage = index === messages.length - 1;
//       const isLastBotReply = isLastMessage && props.role === "assistant";
//       const currentMessageDate = safeParseDate(props.createdAt ?? "");

//       let dateSeparator: React.ReactNode = null;
//       if (
//         currentMessageDate &&
//         (!lastMessageDate || !isSameDay(lastMessageDate, currentMessageDate))
//       ) {
//         dateSeparator = (
//           <DateSeparator
//             key={`date-${props.createdAt}`}
//             date={props.createdAt ?? ""}
//           />
//         );
//         lastMessageDate = currentMessageDate;
//       }

//       const messageComponent =
//         isLastBotReply && props.loading ? (
//           <PromptReply ref={isLastMessage ? replyRef : null} message={props} />
//         ) : (
//           <HistoricalMessage key={props.id || index} message={props} />
//         );

//       return (
//         <Fragment key={props.id || index}>
//           {dateSeparator}
//           {messageComponent}
//         </Fragment>
//       );
//     });
//   };

//   const socket = useSocket();

//   useEffect(() => {
//     if (!socket) return;

//     const handleThread = (data: MessagesEvent) => {
//       if (sessionId === data.sessionId) {
//         setMessages(
//           data.messages.map((message: Message) => ({
//             ...message,
//             streaming: false,
//           }))
//         );
//       }
//     };

//     socket.on("messages", handleThread);

//     return () => {
//       socket.off("messages", handleThread);
//     };
//   }, [socket, sessionId]);

//   useEffect(() => {
//     if (!socket) return;
//     socket.emit("messages", { sessionId, messages });
//   }, [socket, sessionId, messages]);

//   if (messages.length === 0) {
//     return (
//       <div className="h-full max-h-[82vh] pb-[100px] pt-[5px] bg-gray-100 rounded-lg px-2 h-full mt-2 gap-y-2 overflow-y-scroll flex flex-col justify-start no-scroll">
//         <div className="flex h-full flex-col items-center justify-center">
//           <p className="text-slate-400 text-sm font-base py-4 text-center">
//             {"Send a chat to get started!"}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col flex-1 overflow-hidden relative">
//       <div
//         className="flex flex-col flex-1 overflow-auto overflow-x-hidden relative overscroll-none pb-[4px] px-[24px] pt-[24px] bg-white"
//         id="chat-history"
//         ref={chatHistoryRef}
//       >
//         {renderMessages()}
//         {followUps.length > 0 && (
//           <div className="flex flex-col items-end space-y-2 mb-4">
//             {followUps.map((followUp, i) => (
//               <form
//                 key={i}
//                 onSubmit={handleSubmit}
//                 className="border border-input bg-white hover:bg-[#f2f2f2] rounded-[10px] relative px-3 py-2 w-auto max-w-[75%] h-fit"
//               >
//                 <button
//                   ref={i === followUps.length - 1 ? lastFollowUpRef : null}
//                   type="submit"
//                   className="text-left whitespace-normal break-words flex flex-col gap-y-1 text-black text-sm select-text"
//                   onClick={() => setMessage(followUp)}
//                 >
//                   {followUp}
//                 </button>
//               </form>
//             ))}
//           </div>
//         )}
//       </div>
//       {showScrollButton && (
//         <button
//           className="absolute bottom-4 right-4 bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary-dark transition-colors duration-200"
//           onClick={scrollToBottom}
//           aria-label="Scroll to bottom"
//         >
//           <ArrowDown size={24} />
//         </button>
//       )}
//     </div>
//   );
// }

// export function ChatHistoryLoading() {
//   return (
//     <div className="h-full w-full relative">
//       <div className="h-full max-h-[82vh] pb-[100px] pt-[5px] bg-gray-100 rounded-lg px-2 h-full mt-2 gap-y-2 overflow-y-scroll flex flex-col justify-start no-scroll">
//         <div className="flex h-full flex-col items-center justify-center">
//           <CircleNotch size={14} className="text-slate-400 animate-spin" />
//         </div>
//       </div>
//     </div>
//   );
// }

// const DateSeparator = ({ date }: { date: string }) => {
//   const parsedDate = safeParseDate(date);

//   if (!parsedDate) {
//     return null; // Return null if the date is invalid
//   }

//   const formattedDate = isToday(parsedDate)
//     ? "Today"
//     : isYesterday(parsedDate)
//       ? "Yesterday"
//       : format(parsedDate, "MMMM d, yyyy");

//   return (
//     <div className="flex items-center justify-center my-4">
//       <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
//         {formattedDate}
//       </div>
//     </div>
//   );
// };
