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
import { textColorClasses } from "../utils/constants";
import { cn } from "./lib/utils";

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
    const socket = useSocket();
    const { isAgent } = useIsAgent({ chatId: chat.id, socket });
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const chatbot = useChatbot();

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

    useEffect(() => {
      if (isAgent) {
        const contents = message.trim();
        if (contents) {
          if (isTyping) {
            sendEvent({
              isTyping: true,
              typingState: "typing",
              typedContents: contents,
            });
          } else {
            sendEvent({
              isTyping: true,
              typingState: "typed",
              typedContents: contents,
            });
          }
        } else {
          sendEvent({ isTyping: false });
        }
      }
    }, [isAgent, isTyping, message, sendEvent]);

    const themeColor = textColorClasses[chatbot?.themeColor ?? "zinc"];

    return (
      <form
        ref={formRef}
        onSubmit={handleSubmitForm}
        className={`cm-relative cm-w-full cm-flex-col cm-min-h-[56px] cm-max-h-[200px] input-border-top cm-overflow-hidden cm-bg-white`}
        aria-label="Chat input form"
      >
        <div className="cm-flex cm-items-start cm-w-full cm-px-[29px] cm-py-[18px]">
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
            className={`cm-overflow-auto cm-overflow-x-hidden cm-resize-none cm-border-none cm-box-border cm-w-full cm-h-full cm-text-[14px] cm-leading-snug cm-whitespace-pre-wrap cm-break-words cm-max-h-[200px] cm-cursor-text focus:cm-outline-none cm-overscroll-none disabled:cm-bg-white cm-transition-colors cm-duration-200 cm-ease-in-out`}
            placeholder="Send a message"
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={buttonDisabled}
            className="cm-inline-flex cm-justify-center cm-rounded-2xl cm-cursor-pointer cm-group cm-ml-4"
            aria-label="Send message"
          >
            {buttonDisabled ? (
              <CircleNotch
                className="cm-w-4 cm-h-4 cm-animate-spin cm-text-gray-500"
                aria-hidden="true"
              />
            ) : (
              <PaperAirplaneIcon
                className={cn("cm-w-[16px] cm-h-[16px]", themeColor)}
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
