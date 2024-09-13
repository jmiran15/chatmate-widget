import { useCallback, useEffect } from "react";
import ChatWindow from "./components/chatWindow";
import Head from "./components/Head";
import OpenButton from "./components/openButton";
import PendingMessages from "./components/pendingMessages";
import { Button } from "./components/ui/button";
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

interface AppProps {
  embedId: string;
  shadowRoot: ShadowRoot;
}

interface AgentTyping {
  chatId: string;
  isTyping: boolean;
}

export default function App({ embedId, shadowRoot }: AppProps) {
  const socket = useConnectSocket();
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const isMobile = useMobileScreen();
  const sessionId = useSessionId(embedId);
  const chatbot = useChatbot(embedId);
  const session = useSession({ embedId, sessionId, socket });

  const { handleUserActivity } = useTimeTracking({
    isChatOpen,
    sessionId,
    embedId,
    initialActiveTime: session?.chat?.elapsedMs ?? 0,
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

  const handleUserTyping = useCallback(
    (data: AgentTyping) => {
      if (session?.chat?.id !== data.chatId) return;

      session?.setMessages((prevThread) => {
        const lastMessage = prevThread[prevThread.length - 1];
        const isTypingMessage =
          lastMessage?.role === "assistant" &&
          lastMessage?.isPreview &&
          lastMessage?.isTyping;

        if (isTypingMessage && data.isTyping) {
          return prevThread; // No change needed
        } else if (isTypingMessage && !data.isTyping) {
          return prevThread.slice(0, -1);
        } else if (!isTypingMessage && data.isTyping) {
          return [
            ...prevThread,
            {
              id: `preview-${Date.now()}`,
              role: "assistant",
              isPreview: true,
              isTyping: true,
              content: "",
              createdAt: new Date(),
              updatedAt: new Date(),
              chatId: session?.chat?.id,
              clusterId: null,
              seenByUser: undefined,
              seenByAgent: undefined,
              seenByUserAt: undefined,
              activity: undefined,
              loading: true,
              error: null,
            },
          ];
        } else {
          return prevThread;
        }
      });
    },
    [session?.chat?.id, session?.setMessages]
  );

  const handleThread = useCallback(
    (data: { chatId: string; message: any }) => {
      if (session?.chat?.id === data.chatId) {
        console.log("data.message", data.message);
        session?.setMessages((prevThread) => {
          const newMessage = data.message;
          const newMessageTime = new Date(newMessage.createdAt).getTime();

          // Check if the message already exists
          const existingIndex = prevThread.findIndex(
            (m) => m.id === newMessage.id
          );
          if (existingIndex !== -1) {
            // Update existing message
            const updatedThread = [...prevThread];
            updatedThread[existingIndex] = {
              ...updatedThread[existingIndex],
              ...newMessage,
              seenByAgent: updatedThread[existingIndex].seenByAgent,
              seenByUser: updatedThread[existingIndex].seenByUser,
              seenByUserAt:
                updatedThread[existingIndex].seenByUserAt ||
                newMessage.seenByUserAt,
              createdAt: updatedThread[existingIndex].createdAt,
              updatedAt: new Date(newMessage.updatedAt),
            };
            return updatedThread;
          }

          // Find the correct insertion position
          let insertIndex = prevThread.length;
          for (let i = prevThread.length - 1; i >= 0; i--) {
            const currentMessageTime = new Date(
              prevThread[i].createdAt
            ).getTime();
            if (currentMessageTime <= newMessageTime) {
              insertIndex = i + 1;
              break;
            }
          }

          // Insert the new message at the correct position
          const updatedThread = [...prevThread];
          updatedThread.splice(insertIndex, 0, {
            ...newMessage,
            createdAt: new Date(newMessage.createdAt),
            updatedAt: new Date(newMessage.updatedAt),
          });
          return updatedThread;
        });
        session?.setFollowUps([]);
      }
    },
    [session?.chat?.id, session?.setMessages, session?.setFollowUps]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("new message", handleThread);
    socket.on("agent typing", handleUserTyping);

    return () => {
      socket.off("new message", handleThread);
      socket.off("agent typing", handleUserTyping);
    };
  }, [socket, session?.chat?.id]);

  if (!embedId || !chatbot || isRestricted) return null;

  return (
    <SocketProvider socket={socket}>
      <ChatbotProvider chatbot={chatbot}>
        <SessionProvider props={session}>
          <Head />
          <div>
            {/* only in dev */}
            {/* <ElapsedTimeDisplay activeTime={activeTime} /> */}

            {isChatOpen && (
              <ChatWindow
                handleUserActivity={handleUserActivity}
                closeChat={() => toggleOpenChat(false)}
                shadowRoot={shadowRoot}
              />
            )}
            {(!isMobile || !isChatOpen) && (
              <>
                <Button>Testing</Button>
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
                  pending={showStarterPreviews ? 0 : session?.pendingCount ?? 0}
                />
              </>
            )}
          </div>
        </SessionProvider>
      </ChatbotProvider>
    </SocketProvider>
  );
}
