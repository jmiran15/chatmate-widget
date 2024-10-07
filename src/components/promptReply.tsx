import { Warning } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import renderMarkdown from "../utils/markdown";
import { Message } from "../utils/types";
import MessageDateTooltip from "./messageDateTooltip";

const PromptReply = React.forwardRef<
  HTMLDivElement,
  {
    message: Message;
    chatHistoryRef: React.RefObject<HTMLDivElement>;
  }
>(({ message, chatHistoryRef }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { id, content, loading, streaming, error, createdAt } = message;

  if (!content && !loading && !streaming && !error) return null;

  const DotsAnimation = () => (
    <motion.div
      className="cm-flex cm-space-x-1 cm-h-[18px] cm-items-center cm-justify-center"
      initial="start"
      animate="end"
      variants={{
        start: {
          transition: {
            staggerChildren: 0.2,
          },
        },
        end: {
          transition: {
            staggerChildren: 0.2,
            staggerDirection: 1,
            repeat: Infinity,
            repeatDelay: 0.5,
          },
        },
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="cm-w-1.5 cm-h-1.5 cm-bg-gray-500 cm-rounded-full"
          variants={{
            start: {
              y: 0,
            },
            end: {
              y: [-4, 0, -4],
            },
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      ))}
    </motion.div>
  );

  const messageClasses =
    "cm-w-auto cm-max-w-[75%] cm-py-3 cm-px-4 cm-relative cm-inline-block cm-rounded-lg cm-mb-4 cm-bg-[#f2f2f2] cm-text-black";

  if (loading) {
    return (
      <div ref={ref} className={messageClasses}>
        <div className="cm-h-[18px] cm-flex cm-items-center">
          <DotsAnimation />
        </div>
      </div>
    );
  }

  console.log("message", message);

  if (error) {
    return (
      <div className="cm-flex cm-justify-center cm-items-end cm-w-full cm-bg-red-100 cm-rounded-lg">
        <div className="cm-py-2 cm-px-4 cm-w-full cm-flex cm-gap-x-5 cm-flex-col">
          <div className="cm-flex cm-gap-x-5">
            <span className="cm-inline-block cm-p-2 cm-rounded-lg cm-bg-red-50 cm-text-red-500">
              <Warning className="cm-h-4 cm-w-4 cm-mb-1 cm-inline-block" />{" "}
              Could not respond to message.
              <span className="cm-text-xs cm-ml-1">
                Reason: {error || "unknown"}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key={id}
      ref={ref}
      className={messageClasses}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <AnimatePresence>
        {showTooltip && (
          <MessageDateTooltip date={createdAt} parentRef={chatHistoryRef} />
        )}
      </AnimatePresence>
      <span
        className="cm-whitespace-normal cm-break-words cm-flex cm-flex-col cm-gap-y-1 cm-text-sm cm-leading-relaxed cm-min-h-[18px]"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "") }}
      />
    </div>
  );
});

export default React.memo(PromptReply);
