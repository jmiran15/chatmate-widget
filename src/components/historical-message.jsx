import React, { memo, forwardRef } from "react";
import { Warning } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/markdown";
import { v4 } from "uuid";
import createDOMPurify from "dompurify";
import { colors } from "../utils/constants";

const DOMPurify = createDOMPurify(window);

const HistoricalMessage = forwardRef(
  (
    { uuid = v4(), message, role, sources = [], error = false, chatbot },
    ref
  ) => {
    return (
      <div
        key={uuid}
        ref={ref}
        className={`w-auto max-w-[75%] h-fit py-[17px] px-[20px] relative inline-block rounded-[10px] mb-[16px] ${
          error
            ? "bg-red-200"
            : role === "user"
              ? `bg-${colors[chatbot.themeColor]} text-white ml-auto` // Aligns user messages to the right
              : "bg-[#f2f2f2] text-black" // Aligns assistant messages to the left
        }`}
      >
        {error ? (
          <div className="p-2 rounded-lg bg-red-50 text-red-500">
            <span className={`inline-block `}>
              <Warning className="h-4 w-4 mb-1 inline-block" /> Could not
              respond to message.
            </span>
            <p className="text-xs font-mono mt-2 border-l-2 border-red-500 pl-2 bg-red-300 p-2 rounded-sm">
              {error}
            </p>
          </div>
        ) : (
          <span
            className="whitespace-normal break-words flex flex-col gap-y-1 text-[14px] leading-[1.4] min-h-[10px]"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(renderMarkdown(message)),
            }}
          />
        )}
      </div>
    );
  }
);

export default memo(HistoricalMessage);
