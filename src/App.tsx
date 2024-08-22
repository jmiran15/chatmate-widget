import ChatWindow from "./components/chatWindow";
import { ElapsedTimeDisplay } from "./components/ElapsedTimeDisplay";
import Head from "./components/Head";
import OpenButton from "./components/openButton";
import PendingMessages from "./components/pendingMessages";
import useChatbot from "./hooks/useChatbot";
import { useConnectSocket } from "./hooks/useConnectSocket";
import { useIsRestricted } from "./hooks/useIsRestricted";
import useOpenChat from "./hooks/useOpenChat";
import { usePendingMessages } from "./hooks/usePendingMessages";
import { usePingInstallation } from "./hooks/usePingInstallation";
import useSession from "./hooks/useSession";
import useSessionId from "./hooks/useSessionId";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { useWidgetConnection } from "./hooks/useWidgetConnection";
import { ChatbotProvider } from "./providers/chatbot";
import { SessionProvider } from "./providers/session";
import { SocketProvider } from "./providers/socket";
import { useMobileScreen } from "./utils/mobile";

export default function App({ embedId }: { embedId: string }) {
  const socket = useConnectSocket();
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const isMobile = useMobileScreen();
  const sessionId = useSessionId(embedId);
  const chatbot = useChatbot(embedId);
  const session = useSession({ embedId, sessionId });

  const { activeTime, handleUserActivity } = useTimeTracking({
    isChatOpen,
    sessionId,
    embedId,
    initialActiveTime: session?.chat?.elapsedMs || 0,
  });
  const {
    showStarterPreviews,
    handleDismiss,
    pendingStarterMessages,
    delayedShow,
  } = usePendingMessages({
    chatHistory: session?.messages,
    chatbot,
    embedId,
  });
  const isRestricted = useIsRestricted({ chatbot });
  useWidgetConnection({ socket, sessionId });
  usePingInstallation(chatbot);

  if (!embedId || !chatbot || isRestricted) return null;

  return (
    <SocketProvider socket={socket}>
      <ChatbotProvider chatbot={chatbot}>
        <SessionProvider props={session}>
          <Head />
          <div>
            {/* only in dev */}
            <ElapsedTimeDisplay activeTime={activeTime} />

            {isChatOpen && (
              <ChatWindow
                handleUserActivity={handleUserActivity}
                closeChat={() => toggleOpenChat(false)}
              />
            )}
            {(!isMobile || !isChatOpen) && (
              <>
                {!isChatOpen && delayedShow && (
                  <PendingMessages
                    chatbot={chatbot}
                    starterMessages={pendingStarterMessages}
                    openChat={() => toggleOpenChat(true)}
                    handleDismiss={handleDismiss}
                  />
                )}
                <OpenButton
                  isOpen={isChatOpen}
                  toggleOpen={() => toggleOpenChat(!isChatOpen)}
                  chatbot={chatbot}
                  pending={showStarterPreviews ? 0 : session?.pendingCount}
                />
              </>
            )}
          </div>
        </SessionProvider>
      </ChatbotProvider>
    </SocketProvider>
  );
}
