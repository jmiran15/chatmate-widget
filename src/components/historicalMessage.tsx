import { Warning } from "@phosphor-icons/react";
import axios from "axios";
import createDOMPurify from "dompurify";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash/debounce";
import { Check } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import { useAutoForm } from "../hooks/useAutoForm";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useSocket } from "../providers/socket";
import { API_PATH, colors } from "../utils/constants";
import renderMarkdown from "../utils/markdown";
import { Message } from "../utils/types";
import { cn } from "./lib/utils";
import MessageDateTooltip from "./messageDateTooltip";
import AutoForm, { AutoFormSubmit } from "./ui/auto-form";

const DOMPurify = createDOMPurify(window);

const HistoricalMessage: React.FC<{
  message: Message;
  chatHistoryRef: React.RefObject<HTMLDivElement>;
}> = React.memo(({ message, chatHistoryRef }) => {
  const { id, chatId, content, role, createdAt, seenByUser, streaming, error } =
    message;
  const chatbot = useChatbot();
  const { setPendingCount, setMessages } = useSessionContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const socket = useSocket();

  const markAsSeen = useCallback(async () => {
    if (
      !seenByUser &&
      id &&
      !streaming &&
      !error &&
      role !== "user" &&
      socket
    ) {
      try {
        const currentDate = new Date().toISOString();

        const response = await fetch(`${API_PATH}/api/seen/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ seenAt: currentDate }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        socket.emit("seenAgentMessage", {
          chatId,
          messageId: id,
          seenAt: currentDate,
        });

        return true;
      } catch (error) {
        console.error("Error marking message as seen:", error);
        // Consider adding a user-friendly error notification here
        // For example: notifyUser("Failed to mark message as seen. Please try again.");
        return false;
      }
    }
    return false;
  }, [chatId, id, seenByUser, streaming, error, role, socket]);

  const checkVisibility = useCallback(() => {
    if (messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      setIsVisible(isVisible);
    }
  }, []);

  const debouncedCheckVisibility = useCallback(debounce(checkVisibility, 100), [
    checkVisibility,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    window.addEventListener("scroll", debouncedCheckVisibility);
    window.addEventListener("resize", debouncedCheckVisibility);

    // Initial check
    checkVisibility();

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
      window.removeEventListener("scroll", debouncedCheckVisibility);
      window.removeEventListener("resize", debouncedCheckVisibility);
    };
  }, [debouncedCheckVisibility, checkVisibility]);

  useEffect(() => {
    if (isVisible && !seenByUser) {
      markAsSeen().then((wasMarked) => {
        if (wasMarked) {
          setPendingCount((prevCount: number) => Math.max(0, prevCount - 1));
          setMessages((messages: Message[]) =>
            messages.map((msg) =>
              msg.id === id ? { ...msg, seenByUser: true } : msg
            )
          );
        }
      });
    }
  }, [isVisible, seenByUser, markAsSeen, setPendingCount, setMessages, id]);

  const userMessageColor =
    colors[(chatbot?.themeColor ?? "zinc") as keyof typeof colors];

  const messageClasses = `cm-w-auto cm-max-w-[75%] cm-h-fit cm-py-[17px] cm-px-[20px] cm-relative cm-inline-block cm-rounded-[10px] cm-mb-[16px] ${
    error
      ? "cm-bg-red-200"
      : role === "user"
        ? cn(userMessageColor, "cm-text-white cm-ml-auto")
        : "cm-bg-[#f2f2f2] cm-text-black"
  }`;

  if (message.activity) {
    return (
      <TextSeparator
        ref={messageRef}
        text={message.content}
        className="cm-mb-[16px]"
      />
    );
  }

  const messageContent = useMemo(() => {
    if (message.isFormMessage) {
      return <FormMessage message={message} setMessages={setMessages} />;
    } else {
      return (
        <span
          className="cm-whitespace-normal cm-break-words cm-flex cm-flex-col cm-gap-y-1 cm-text-[14px] cm-leading-[1.4] cm-min-h-[10px]"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(renderMarkdown(content ?? "")),
          }}
        />
      );
    }
  }, [message.isFormMessage, message.form, message.formSubmission, content]);

  return (
    <div
      ref={messageRef}
      className={messageClasses}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <AnimatePresence>
        {showTooltip && (
          <MessageDateTooltip
            date={createdAt ?? new Date()}
            parentRef={chatHistoryRef}
          />
        )}
      </AnimatePresence>
      {error ? (
        <div className="cm-p-2 cm-rounded-lg cm-bg-red-50 cm-text-red-500">
          <span className="cm-inline-block">
            <Warning className="cm-h-4 cm-w-4 cm-mb-1 cm-inline-block" /> Could
            not respond to message.
          </span>
          <p className="cm-text-xs cm-font-mono cm-mt-2 cm-border-l-2 cm-border-red-500 cm-pl-2 cm-bg-red-300 cm-p-2 cm-rounded-sm">
            {error}
          </p>
        </div>
      ) : (
        messageContent
      )}
    </div>
  );
});

export default HistoricalMessage;

interface TextSeparatorProps {
  text: string;
  className?: string;
  lineColor?: string;
  textColor?: string;
}

const TextSeparator = forwardRef<HTMLDivElement, TextSeparatorProps>(
  (
    {
      text,
      className = "",
      lineColor = "cm-border-gray-300",
      textColor = "cm-text-gray-500",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`cm-flex cm-items-center cm-w-full ${className}`}
      >
        <div className={`cm-flex-grow cm-border-t ${lineColor}`}></div>
        <span className={`cm-flex-shrink cm-mx-4 cm-text-xs ${textColor}`}>
          {text}
        </span>
        <div className={`cm-flex-grow cm-border-t ${lineColor}`}></div>
      </div>
    );
  }
);

TextSeparator.displayName = "TextSeparator";

// The form submission message

function FormSubmissionMessage() {
  return (
    <div className="cm-flex cm-flex-col cm-items-start cm-space-y-3">
      <motion.div
        className="cm-flex cm-items-center cm-space-x-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="cm-bg-blue-100 cm-rounded-full cm-p-1">
          <Check className="cm-w-5 cm-h-5 cm-text-blue-500" />
        </div>
        <span className="cm-whitespace-normal cm-flex cm-flex-col cm-gap-y-1 cm-text-[14px] cm-leading-[1.4] cm-min-h-[10px] cm-font-medium">
          Thank you for your submission!
        </span>
      </motion.div>
    </div>
  );
}

function FormMessage({
  message,
  setMessages,
}: {
  message: Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  // check if we have a formSubmission
  if (message.formSubmission) {
    return <FormSubmissionMessage />;
  }

  if (!message.form || !message.form.elements) {
    return null;
  }

  const { formSchema, fieldConfig } = useAutoForm(message.form.elements);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    try {
      const validatedData = formSchema.parse(data);
      console.log("submitting form", message);

      // lets call the route /api/form-submission with axios as POSt with the data as json body
      axios
        .post(`${API_PATH}/api/form-submission`, {
          flowId: message.flowId,
          formId: message.form?.id,
          messageId: message.id,
          submissionData: validatedData,
          chatId: message.chatId,
        })
        .then((response) => {
          const updatedMessage = response.data?.updatedMessage;
          // update the state with the submission
          // we need to setMessages after the submission to update it
          setMessages((messages: Message[]) =>
            messages.map((msg) =>
              msg.id === updatedMessage.id
                ? {
                    ...updatedMessage,
                    createdAt: new Date(updatedMessage.createdAt),
                    updatedAt: new Date(updatedMessage.updatedAt),
                  }
                : msg
            )
          );
        })
        .catch(function (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
          console.log(error.config);
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Form submitted with errors:", error.errors);
      }
    }
  };

  return (
    <AutoForm
      formSchema={formSchema}
      fieldConfig={fieldConfig}
      onSubmit={handleSubmit}
    >
      <AutoFormSubmit>Submit</AutoFormSubmit>
    </AutoForm>
  );
}
