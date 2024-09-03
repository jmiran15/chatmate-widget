import { Warning } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Message } from "src/utils/types";
import renderMarkdown from "../utils/markdown";
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
      className="flex space-x-1 h-[18px] items-center justify-center"
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
          className="w-1.5 h-1.5 bg-gray-500 rounded-full"
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
    "w-auto max-w-[75%] py-3 px-4 relative inline-block rounded-lg mb-4 bg-[#f2f2f2] text-black";

  if (loading) {
    return (
      <div ref={ref} className={messageClasses}>
        <div className="h-[18px] flex items-center">
          <DotsAnimation />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-end w-full bg-red-100 rounded-lg">
        <div className="py-2 px-4 w-full flex gap-x-5 flex-col">
          <div className="flex gap-x-5">
            <span className="inline-block p-2 rounded-lg bg-red-50 text-red-500">
              <Warning className="h-4 w-4 mb-1 inline-block" /> Could not
              respond to message.
              <span className="text-xs ml-1">Reason: {error || "unknown"}</span>
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
        className="whitespace-normal break-words flex flex-col gap-y-1 text-sm leading-relaxed min-h-[18px]"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "") }}
      />
    </div>
  );
});

export default React.memo(PromptReply);
