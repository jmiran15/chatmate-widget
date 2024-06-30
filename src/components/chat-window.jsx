import ChatWindowHeader from "./chat-header";
import useChatHistory from "../hooks/use-chat";
import ChatContainer from "./chat-container";
import { ChatHistoryLoading } from "./chat-history";
import { useMobileScreen } from "@/utils/mobile";

export default function ChatWindow({
  closeChat,
  embedId,
  sessionId,
  chatbot,
  chatbotId,
  setPending,
  setChatHistory,
  chatHistory,
  loading,
}) {
  const isMobile = useMobileScreen();

  if (loading) {
    return (
      <div
        className="flex flex-col flex-1 fixed bottom-[84px] right-[20px] z-[9999] min-h-[80px] w-[400px] max-h-[704px] opacity-100 overflow-hidden chat-window-custom"
        style={{
          borderRadius: isMobile ? "0rem" : chatbot.containerRadius + "rem",
        }}
      >
        <ChatWindowHeader
          sessionId={sessionId}
          embedId={embedId}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
          chatbot={chatbot}
        />
        <ChatHistoryLoading />
      </div>
    );
  }

  const mobileStyle =
    "flex flex-col flex-1 fixed bottom-0 right-0 z-[9999] opacity-100 overflow-hidden h-dvh w-dvw";

  const desktopStyle =
    "flex flex-col flex-1 fixed bottom-[84px] right-[20px] z-[9999] min-h-[80px] w-[400px] max-h-[704px] opacity-100 overflow-hidden chat-window-custom";

  setEventDelegatorForCodeSnippets();
  return (
    <div
      className={isMobile ? mobileStyle : desktopStyle}
      style={{
        borderRadius: isMobile ? "0rem" : chatbot.containerRadius + "rem",
      }}
    >
      <ChatWindowHeader
        sessionId={sessionId}
        embedId={embedId}
        closeChat={closeChat}
        setChatHistory={setChatHistory}
        chatbot={chatbot}
      />
      <ChatContainer
        sessionId={sessionId}
        embedId={embedId}
        knownHistory={chatHistory}
        chatbot={chatbot}
        chatbotId={chatbotId}
        setPending={setPending}
        setChatHistory={setChatHistory}
      />
    </div>
  );
}

// Enables us to safely markdown and sanitize all responses without risk of injection
// but still be able to attach a handler to copy code snippets on all elements
// that are code snippets.
function copyCodeSnippet(uuid) {
  const target = document.querySelector(`[data-code="${uuid}"]`);
  if (!target) return false;
  const markdown =
    target.parentElement?.parentElement?.querySelector(
      "pre:first-of-type"
    )?.innerText;
  if (!markdown) return false;

  window.navigator.clipboard.writeText(markdown);
  target.classList.add("text-green-500");
  const originalText = target.innerHTML;
  target.innerText = "Copied!";
  target.setAttribute("disabled", true);

  setTimeout(() => {
    target.classList.remove("text-green-500");
    target.innerHTML = originalText;
    target.removeAttribute("disabled");
  }, 2500);
}

// Listens and hunts for all data-code-snippet clicks.
function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}
