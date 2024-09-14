import { Warning } from "@phosphor-icons/react";
import axios from "axios";
import createDOMPurify from "dompurify";
import { AnimatePresence, motion } from "framer-motion";
import jsonSchemaToZod from "json-schema-to-zod";
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
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useSocket } from "../providers/socket";
import { API_PATH, colors } from "../utils/constants";
import renderMarkdown from "../utils/markdown";
import { Message } from "../utils/types";
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

  const messageClasses = `w-auto max-w-[75%] h-fit py-[17px] px-[20px] relative inline-block rounded-[10px] mb-[16px] ${
    error
      ? "bg-red-200"
      : role === "user"
        ? `bg-${colors[(chatbot?.themeColor ?? "zinc") as keyof typeof colors]} text-white ml-auto`
        : "bg-[#f2f2f2] text-black"
  }`;

  if (message.activity) {
    return (
      <TextSeparator
        ref={messageRef}
        text={message.content}
        className="mb-[16px]"
      />
    );
  }

  const messageContent = useMemo(() => {
    if (message.isFormMessage) {
      // check if we have a formSubmission
      if (message.formSubmission) {
        return <FormSubmissionMessage />;
      }

      const formSchema = message.form?.formSchema;
      const zodSchemaString = jsonSchemaToZod(
        formSchema?.schema?.definitions.formSchema
      );

      const schemaString = `
// you can put any helper function or code directly inside the string and use them in your schema

function getZodSchema({z, ctx}) {
  // use ctx for any dynamic data that your schema depends on
  return ${zodSchemaString};
}
`;

      const zodSchema = Function(
        "...args",
        `${schemaString}; return getZodSchema(...args)`
      )({ z, ctx: {} });

      const handleSubmit = (data: z.infer<typeof formSchema.schema>) => {
        try {
          const validatedData = zodSchema.parse(data);

          // lets call the route /api/form-submission with axios as POSt with the data as json body
          axios
            .post(`${API_PATH}/api/form-submission`, {
              formId: message.form?.id,
              messageId: message.id,
              submissionData: validatedData,
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
          formSchema={zodSchema}
          fieldConfig={formSchema?.fieldConfig}
          onSubmit={handleSubmit}
        >
          <AutoFormSubmit>Submit</AutoFormSubmit>
        </AutoForm>
      );
    } else {
      return (
        <span
          className="whitespace-normal break-words flex flex-col gap-y-1 text-[14px] leading-[1.4] min-h-[10px]"
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
      lineColor = "border-gray-300",
      textColor = "text-gray-500",
    },
    ref
  ) => {
    return (
      <div ref={ref} className={`flex items-center w-full ${className}`}>
        <div className={`flex-grow border-t ${lineColor}`}></div>
        <span className={`flex-shrink mx-4 text-xs ${textColor}`}>{text}</span>
        <div className={`flex-grow border-t ${lineColor}`}></div>
      </div>
    );
  }
);

TextSeparator.displayName = "TextSeparator";

// The form submission message

function FormSubmissionMessage() {
  return (
    <div className="flex flex-col items-start space-y-3">
      <motion.div
        className="flex items-center space-x-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="bg-blue-100 rounded-full p-1">
          <Check className="w-5 h-5 text-blue-500" />
        </div>
        <span className="whitespace-normal flex flex-col gap-y-1 text-[14px] leading-[1.4] min-h-[10px] font-medium">
          Thank you for your submission!
        </span>
      </motion.div>
    </div>
  );
}
