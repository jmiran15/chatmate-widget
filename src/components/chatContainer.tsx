import axios from "axios";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { useIsAgent } from "../hooks/useIsAgent";
import { StreamChatRequest } from "../hooks/useSession";
import { useChatbot } from "../providers/chatbot";
import { useSessionContext } from "../providers/session";
import { API_PATH } from "../utils/constants";
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
  const { isAgent } = useIsAgent({ chatId: chat?.id || "" });

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
    if (!message || message === "") return false;

    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    switch (isAgent) {
      case true: {
        setFollowUps([]);

        const prevChatHistory = [
          ...messages,
          {
            id: v4(),
            content: message,
            role: "user",
            createdAt: formattedDate,
            streaming: false,
            seenByUser: true,
            seenByAgent: false,
          },
        ];

        await axios.post(`${API_PATH}/api/chat/${chatbot?.id}/${sessionId}`, {
          messages: prevChatHistory,
          chattingWithAgent: true,
        } as StreamChatRequest);

        setMessages(prevChatHistory);
        setMessage("");
        break;
      }
      case false: {
        const prevChatHistory = [
          ...messages,
          {
            id: v4(),
            content: message,
            role: "user",
            createdAt: formattedDate,
            streaming: false,
            seenByUser: true,
            seenByAgent: false,
          },
          {
            id: v4(),
            content: "",
            role: "assistant",
            createdAt: formattedDate,
            streaming: true,
            loading: true,
            seenByAgent: true,
          },
        ];

        // there might be a race condition here
        setMessages(prevChatHistory);
        setMessage("");
        fetchReply();
        // if (loading) setFollowUps([]);

        // return await streamChat({
        //   message,
        // });
        break;
      }
    }
  };

  // TODO - just do this in the above
  async function fetchReply() {
    if (!message) {
      return false;
    }

    if (loading) setFollowUps([]);

    return await streamChat({
      message,
    });
  }

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden min-w-full block">
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
