import ChatWindowHeader from "./chat-header";
import SessionId from "./session-id";
import useChatHistory from "@/hooks/chat/useChatHistory";
import ChatContainer from "./chat-container";
import Sponsor from "./sponsor";
import { ChatHistoryLoading } from "./chat-history";

export default function ChatWindow({
  closeChat,
  settings,
  sessionId,
  chatbot,
  chatbotId,
}) {
  const { chatHistory, setChatHistory, loading } = useChatHistory(
    settings,
    sessionId
  );

  if (loading) {
    return (
      <div className="flex flex-col flex-1 fixed bottom-[84px] right-[20px] z-9999 min-h-[80px] w-[400px] max-h-[704px] rounded-[16px] opacity-100 overflow-hidden bg-red-100 chat-window-custom">
        {/* <ChatWindowHeader
          sessionId={sessionId}
          settings={settings}
          iconUrl={settings.brandImageUrl}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
        />
        <ChatHistoryLoading />
        <div className="pt-4 pb-2 h-fit gap-y-1">
          <SessionId />
          <Sponsor settings={settings} />
        </div> */}
      </div>
    );
  }

  setEventDelegatorForCodeSnippets();
  return (
    <div className="flex flex-col flex-1 fixed bottom-[84px] right-[20px] z-9999 min-h-[80px] w-[400px] max-h-[704px] rounded-[16px] opacity-100 overflow-hidden chat-window-custom">
      <ChatWindowHeader
        sessionId={sessionId}
        settings={settings}
        iconUrl={settings.brandImageUrl}
        closeChat={closeChat}
        setChatHistory={setChatHistory}
      />
      <ChatContainer
        sessionId={sessionId}
        settings={settings}
        knownHistory={chatHistory}
        chatbot={chatbot}
        chatbotId={chatbotId}
      />
      {/* <div className="pt-4 pb-2 h-fit gap-y-1">
        <SessionId />
        <Sponsor settings={settings} />
      </div>{" "} */}
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
