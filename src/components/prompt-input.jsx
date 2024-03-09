import { CircleNotch } from "@phosphor-icons/react";
import React, { useState, useRef } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { colors } from "@/App";

export default function PromptInput({
  message,
  submit,
  onChange,
  inputDisabled,
  buttonDisabled,
  chatbot,
}) {
  const formRef = useRef(null);
  const [_, setFocused] = useState(false);

  const handleSubmit = (e) => {
    setFocused(false);
    submit(e);
  };

  const captureEnter = (event) => {
    if (event.keyCode == 13) {
      if (!event.shiftKey) {
        submit(event);
      }
    }
  };

  const adjustTextArea = (event) => {
    const element = event.target;
    element.style.height = "auto";
    element.style.height =
      event.target.value.length !== 0 ? element.scrollHeight + "px" : "auto";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full flex-col min-h-[56px] max-h-[200px] input-border-top overflow-hidden bg-white"
    >
      <div className="flex items-start w-full px-[29px] py-[18px]">
        <textarea
          onKeyUp={adjustTextArea}
          onKeyDown={captureEnter}
          onChange={onChange}
          required={true}
          disabled={inputDisabled}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            adjustTextArea(e);
          }}
          value={message}
          className="overflow-auto overflow-x-hidden resize-none border-none box-border w-full h-full text-[14px] leading-snug whitespace-pre-wrap	break-words	max-h-[200px] cursor-text focus:outline-none overscroll-none disabled:bg-white"
          placeholder={"Send a message"}
        />
        <button
          ref={formRef}
          type="submit"
          disabled={buttonDisabled}
          className="inline-flex justify-center rounded-2xl cursor-pointer group ml-4"
        >
          {buttonDisabled ? (
            <CircleNotch className="w-4 h-4 animate-spin" />
          ) : (
            <PaperAirplaneIcon
              className={`w-[16px] h-[16px] text-${colors[chatbot.themeColor]}`}
            />
          )}
          <span className="sr-only">Send message</span>
        </button>
      </div>
    </form>
  );
}
