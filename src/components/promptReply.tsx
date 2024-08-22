import { Warning } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import { forwardRef, memo, useState } from "react";
import { RenderableMessage } from "../hooks/useSession";
import renderMarkdown from "../utils/markdown";
import MessageDateTooltip from "./message-date-tooltip";

const PromptReply = forwardRef(
  ({ message }: { message: RenderableMessage }, ref) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const { id, content, loading, streaming, error, createdAt } = message;

    if (!content && !loading && !streaming && !error) return null;

    if (loading) {
      return (
        <div
          ref={ref}
          className={`w-auto max-w-[75%] h-fit py-[17px] px-[20px] relative inline-block rounded-[10px] mb-[16px] bg-[#f2f2f2] text-black`}
        >
          <div className="mx-[20px] dot-falling"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`flex justify-center items-end w-full bg-red-200`}>
          <div className="py-2 px-4 w-full flex gap-x-5 flex-col">
            <div className="flex gap-x-5">
              <span
                className={`inline-block p-2 rounded-lg bg-red-50 text-red-500`}
              >
                <Warning className="h-4 w-4 mb-1 inline-block" /> Could not
                respond to message.
                <span className="text-xs">Reason: {error || "unknown"}</span>
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
        className="w-auto max-w-[75%] h-fit py-[17px] px-[20px] relative inline-block rounded-[10px] mb-[16px] bg-[#f2f2f2] text-black"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AnimatePresence>
          {showTooltip && <MessageDateTooltip date={createdAt} />}
        </AnimatePresence>
        <span
          className="whitespace-normal break-words flex flex-col gap-y-1 text-[14px] leading-[1.4] min-h-[10px]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "") }}
        />
      </div>
    );
  }
);

export default memo(PromptReply);
