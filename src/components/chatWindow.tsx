import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useMobileScreen } from "../utils/mobile";
import ChatContainer from "./chatContainer";
import ChatWindowHeader from "./chatHeader";
import { ChatHistoryLoading } from "./chatHistory";

export default function ChatWindow({
  handleUserActivity,
  closeChat,
}: {
  handleUserActivity: () => void;
  closeChat: () => void;
}) {
  const chatbot = useChatbot();
  const isMobile = useMobileScreen();
  const isLeftAligned = chatbot?.widgetPosition === "BOTTOM_LEFT";
  const { loading } = useSessionContext();

  if (loading) {
    return (
      <div
        className="flex flex-col flex-1 fixed bottom-[84px] z-[9999] min-h-[80px] w-[400px] max-h-[704px] opacity-100 overflow-hidden chat-window-custom"
        style={{
          borderRadius: isMobile ? "0rem" : chatbot?.containerRadius + "rem",
          ...(isMobile ? {} : { [isLeftAligned ? "left" : "right"]: "20px" }),
        }}
      >
        <ChatWindowHeader closeChat={closeChat} />
        <ChatHistoryLoading />
      </div>
    );
  }

  const mobileStyle =
    "flex flex-col flex-1 fixed bottom-0 right-0 z-[9999] opacity-100 overflow-hidden h-dvh w-dvw";

  const desktopStyle =
    "flex flex-col flex-1 fixed bottom-[84px] z-[9999] min-h-[80px] w-[400px] max-h-[704px] opacity-100 overflow-hidden chat-window-custom";

  setEventDelegatorForCodeSnippets();
  return (
    <div
      className={isMobile ? mobileStyle : desktopStyle}
      style={{
        borderRadius: isMobile ? "0rem" : chatbot?.containerRadius + "rem",
        ...(isMobile ? {} : { [isLeftAligned ? "left" : "right"]: "20px" }),
      }}
    >
      <ChatWindowHeader closeChat={closeChat} />
      <ChatContainer handleUserActivity={handleUserActivity} />
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
