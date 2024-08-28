import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { CircleNotch } from "@phosphor-icons/react";
import debounce from "lodash/debounce";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIsAgent } from "../hooks/useIsAgent";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useSocket } from "../providers/socket";
import { colors } from "../utils/constants";

const PromptInput: React.FC<{
  message: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  inputDisabled: boolean;
  buttonDisabled: boolean;
}> = React.memo(
  ({
    message,
    handleSubmit,
    handleMessageChange,
    inputDisabled,
    buttonDisabled,
  }) => {
    const { chat } = useSessionContext();
    const { isAgent } = useIsAgent({ chatId: chat.id });
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const chatbot = useChatbot();
    const socket = useSocket();

    useEffect(() => {
      console.log("isAgent", isAgent);
      if (isAgent) {
        const contents = message.trim();
        console.log("contents", contents);
        if (contents) {
          if (isTyping) {
            sendEvent({
              isTyping: true,
              typingState: "typing",
              typedContents: contents,
            });
          } else {
            sendEvent({
              isTyping: false,
              typingState: "typed",
              typedContents: contents,
            });
          }
        } else {
          sendEvent({ isTyping: false });
        }
      }
    }, [isAgent]);

    const sendEvent = useCallback(
      (event: {
        isTyping: boolean;
        typingState?: "typing" | "typed";
        typedContents?: string;
      }) => {
        if (isAgent) {
          socket?.emit("userTyping", { ...event, chatId: chat.id });
        }
      },
      [socket, chat, isAgent]
    );

    const sendTypingEvent = useCallback(
      (contents: string) => {
        sendEvent({
          isTyping: true,
          typingState: "typing",
          typedContents: contents,
        });
      },
      [sendEvent]
    );

    const handleSubmitForm = useCallback(
      (e: React.FormEvent<HTMLFormElement>) => {
        setIsTyping(false);
        console.log("not typing - handleSubmitForm");
        sendEvent({ isTyping: false });
        handleSubmit(e);
      },
      [handleSubmit, sendEvent]
    );

    const captureEnter = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          formRef.current?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
          );
        }
      },
      []
    );

    const adjustTextArea = useMemo(
      () =>
        debounce((element: HTMLTextAreaElement) => {
          element.style.height = "auto";
          element.style.height =
            element.value.length !== 0 ? `${element.scrollHeight}px` : "auto";
        }, 100),
      []
    );

    const handleTextareaChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleMessageChange(event);
        adjustTextArea(event.target);

        const contents = event.target.value.trim();
        if (contents) {
          setIsTyping(true);
          sendTypingEvent(contents);
        } else {
          console.log("not typing - handleTextareaChange");
          setIsTyping(false);
          sendEvent({ isTyping: false });
        }
      },
      [handleMessageChange, adjustTextArea, sendTypingEvent, sendEvent]
    );

    const handleStopTyping = () => {
      if (isTyping) {
        const contents = textareaRef.current?.value.trim();
        if (contents) {
          sendEvent({
            isTyping: true,
            typingState: "typed",
            typedContents: contents,
          });
        } else {
          sendEvent({ isTyping: false });
        }
        setIsTyping(false);
      }
    };

    useEffect(() => {
      const stopTypingTimer = setTimeout(handleStopTyping, 1000);

      const handleWindowBlur = () => {
        handleStopTyping();
      };

      window.addEventListener("blur", handleWindowBlur);

      return () => {
        clearTimeout(stopTypingTimer);
        window.removeEventListener("blur", handleWindowBlur);
      };
    }, [message]);

    useEffect(() => {
      if (inputDisabled) {
        setIsTyping(false);
        sendEvent({ isTyping: false });
      }
    }, [inputDisabled, sendEvent]);

    const themeColor = useMemo(
      () => colors[(chatbot?.themeColor || "zinc") as keyof typeof colors],
      [chatbot?.themeColor]
    );

    return (
      <form
        ref={formRef}
        onSubmit={handleSubmitForm}
        className={`relative w-full flex-col min-h-[56px] max-h-[200px] input-border-top overflow-hidden bg-white`}
        aria-label="Chat input form"
      >
        <div className="flex items-start w-full px-[29px] py-[18px]">
          <textarea
            ref={textareaRef}
            onKeyUp={captureEnter}
            onChange={handleTextareaChange}
            required
            disabled={inputDisabled}
            onBlur={() => {
              handleStopTyping();
            }}
            value={message}
            className={`overflow-auto overflow-x-hidden resize-none border-none box-border w-full h-full text-[14px] leading-snug whitespace-pre-wrap break-words max-h-[200px] cursor-text focus:outline-none overscroll-none disabled:bg-white transition-colors duration-200 ease-in-out`}
            placeholder="Send a message"
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={buttonDisabled}
            className="inline-flex justify-center rounded-2xl cursor-pointer group ml-4"
            aria-label="Send message"
          >
            {buttonDisabled ? (
              <CircleNotch
                className="w-4 h-4 animate-spin text-gray-500"
                aria-hidden="true"
              />
            ) : (
              <PaperAirplaneIcon
                className={`w-[16px] h-[16px] text-${themeColor}`}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </form>
    );
  }
);

PromptInput.displayName = "PromptInput";

export default PromptInput;
