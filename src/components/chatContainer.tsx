import axios from "axios";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { useIsAgent } from "../hooks/useIsAgent";
import { StreamChatRequest } from "../hooks/useSession";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { useSocket } from "../providers/socket";
import { API_PATH } from "../utils/constants";
import { Message } from "../utils/types";
import ChatHistory from "./chatHistory";
import PromptInput from "./promptInput";

export default function ChatContainer({
  handleUserActivity,
}: {
  handleUserActivity: () => void;
}) {
  const [message, setMessage] = useState(() => ""); // this could go inside the prompt input?
  const chatbot = useChatbot();
  const {
    chat,
    sessionId,
    messages,
    setMessages,
    loading,
    streamChat,
    followUps,
    setFollowUps,
  } = useSessionContext();
  const socket = useSocket();
  const { isAgent } = useIsAgent({ chatId: chat?.id, socket });

  const showInitalStarterQuestions = useMemo(() => {
    return messages.length <= (chatbot?.introMessages?.length || 0);
  }, [messages, chatbot]);

  useEffect(() => {
    if (showInitalStarterQuestions) {
      setFollowUps(chatbot?.starterQuestions || []);
    }
  }, [showInitalStarterQuestions]);

  const debouncedHandleUserActivity = useCallback(
    debounce(handleUserActivity, 300),
    []
  );
  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(event.target.value);
    debouncedHandleUserActivity();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message || message.trim() === "") return false;
    setFollowUps([]);

    const currentDate = new Date();
    // const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const newMessage = {
      id: v4(),
      createdAt: currentDate,
      updatedAt: currentDate,
      role: "user",
      content: message,
      chatId: chat?.id,
      streaming: false,
      seenByUser: true,
      seenByAgent: false,
      seenByUserAt: currentDate,
    } as Message;

    switch (isAgent) {
      case true: {
        const prevChatHistory = [...messages, newMessage];

        setMessages(prevChatHistory);
        setMessage("");

        await axios.post(`${API_PATH}/api/chat/${chatbot?.id}/${sessionId}`, {
          messages: prevChatHistory,
          chattingWithAgent: true,
        } as StreamChatRequest);

        // emit after the message has been created
        if (socket) {
          socket.emit("new message", {
            chatId: chat?.id,
            message: newMessage,
          });
        }

        break;
      }
      case false: {
        // const prevChatHistory = [
        //   ...messages,
        //   newMessage,
        //   {
        //     id: v4(),
        //     chatId: chat?.id,
        //     createdAt: currentDate,
        //     updatedAt: currentDate,
        //     role: "assistant",
        //     content: "",
        //     streaming: true,
        //     loading: true,
        //     seenByAgent: true,
        //   } as Message,
        // ];

        // setMessages(prevChatHistory);
        setMessage("");

        return await streamChat({
          message,
        });
      }
    }
  };

  return (
    <div className="cm-relative cm-flex cm-flex-col cm-flex-1 cm-overflow-hidden cm-min-w-full cm-block">
      <ChatHistory
        followUps={followUps}
        handleSubmit={handleSubmit}
        setMessage={setMessage}
      />
      <PromptInput
        message={message}
        handleSubmit={handleSubmit}
        handleMessageChange={handleMessageChange}
        inputDisabled={loading}
        buttonDisabled={loading}
      />
    </div>
  );
}
