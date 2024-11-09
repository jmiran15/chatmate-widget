// TODO - currently have to build before running yarn run dev

import axios from "axios";
import { useCallback, useEffect } from "react";
import ChatWindow from "./components/chatWindow";
import Head from "./components/Head";
import OpenButton from "./components/openButton";
import PendingMessages from "./components/pendingMessages";
import useChatbot from "./hooks/useChatbot";
import { useConnectSocket } from "./hooks/useConnectSocket";
import { useIsRestricted } from "./hooks/useIsRestricted";
import { useMessageProcessor } from "./hooks/useMessageProcessor";
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
import { API_PATH } from "./utils/constants";
import { useMobileScreen } from "./utils/mobile";
import { Message } from "./utils/types";

interface AppProps {
  embedId: string;
}

interface AgentTyping {
  chatId: string;
  isTyping: boolean;
}

export default function App({ embedId }: AppProps) {
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

  const { addMessageToQueue } = useMessageProcessor({
    setMessages: session?.setMessages,
    setFollowUps: session?.setFollowUps,
    messages: session?.messages,
  });

  const handleThread = useCallback(
    (data: { chatId: string; message: Message }) => {
      if (session?.chat?.id === data.chatId) {
        console.log("processing message", data.message);
        addMessageToQueue(data.message);
      }
    },
    [session?.chat?.id, addMessageToQueue]
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

  // TODO - not very robust, but it works for now
  const isInitialThread_ =
    session?.messages?.length <= (chatbot?.introMessages?.length || 0);
  useEffect(() => {
    if (
      isChatOpen &&
      !session?.chat?.hasLoadedInitialMessages &&
      isInitialThread_ &&
      session?.chat?.id &&
      chatbot?.id
    ) {
      axios
        .post(`${API_PATH}/api/initialload/${session.chat.id}/${chatbot.id}`)
        .then((res) => {
          console.log(res.data);
          const { chat } = res.data;
          if (chat) {
            session?.setChat(chat);
          }
        })
        .catch((error) => {
          session?.setMessages([]);
          session?.setLoading(false);
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
          console.log(error.config);
        });
    }
  }, [
    session?.chat?.id,
    session?.chat?.hasLoadedInitialMessages,
    chatbot?.id,
    isChatOpen,
    isInitialThread_,
  ]);

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
                shadowRoot={null}
              />
            )}
            {(!isMobile || !isChatOpen) && (
              <>
                {!isChatOpen &&
                  delayedShow &&
                  chatbot.showIntroPreview !== false && (
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
