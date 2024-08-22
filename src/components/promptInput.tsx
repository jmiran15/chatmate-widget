import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { CircleNotch } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useChatbot } from "../providers/chatbot";
import { colors } from "../utils/constants";

export default function PromptInput({
  message,
  handleSubmit,
  handleMessageChange,
  inputDisabled,
  buttonDisabled,
}: {
  message: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  inputDisabled: boolean;
  buttonDisabled: boolean;
}) {
  const formRef = useRef(null);
  const [_, setFocused] = useState(false);
  const chatbot = useChatbot();

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    setFocused(false);
    handleSubmit(e);
  };

  const captureEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const adjustTextArea = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const element = event.target;
    element.style.height = "auto";
    element.style.height =
      event.target.value.length !== 0 ? element.scrollHeight + "px" : "auto";
  };

  return (
    <form
      onSubmit={handleSubmitForm}
      className="relative w-full flex-col min-h-[56px] max-h-[200px] input-border-top overflow-hidden bg-white"
    >
      <div className="flex items-start w-full px-[29px] py-[18px]">
        <textarea
          onKeyUp={captureEnter}
          onChange={handleMessageChange}
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
              className={`w-[16px] h-[16px] text-${colors[(chatbot?.themeColor || "zinc") as keyof typeof colors]}`}
            />
          )}
          <span className="sr-only">Send message</span>
        </button>
      </div>
    </form>
  );
}
