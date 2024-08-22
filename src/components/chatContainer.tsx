import axios from "axios";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { useCallback, useMemo, useState } from "react";
import { v4 } from "uuid";
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
  const { isAgent, sessionId, messages, setMessages, loading, streamChat } =
    useSessionContext();
  const showInitalStarterQuestions = useMemo(() => {
    return messages.length <= (chatbot?.introMessages?.length || 0);
  }, [messages, chatbot]);
  const [followUps, setFollowUps] = useState(
    showInitalStarterQuestions ? chatbot?.starterQuestions : []
  );
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

  // Resync history if the ref to known history changes
  // eg: cleared.
  // useEffect(() => {
  //   if (knownHistory.length !== chatHistory.length)
  //     setChatHistory([...knownHistory]);
  // }, [knownHistory]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message || message === "") return false;

    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    switch (isAgent) {
      case true: {
        const prevChatHistory = [
          ...messages,
          {
            id: v4(),
            content: message,
            role: "user",
            createdAt: formattedDate,
            streaming: false,
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
          },
          {
            id: v4(),
            content: "",
            role: "assistant",
            createdAt: formattedDate,
            streaming: true,
            loading: true,
          },
        ];

        // there might be a race condition here
        setMessages(prevChatHistory);
        setMessage("");
        fetchReply();
        break;
      }
    }
  };

  async function fetchReply() {
    if (!message) {
      return false;
    }

    if (loading) setFollowUps([]);

    await streamChat({
      message,
    });

    // this will probably be incorrect because state doesnt update immediately - probbaly just add to useSession hook "generateFollowUps..."
    // on finish of streamChat, i.e. if in streamTextChunk we get streaming: false, then call generateFollowUps, and set the followUps in state
    // const followUpRes = await fetch(`${API_PATH}/api/generatefollowups`, {
    //   method: "POST",
    //   body: JSON.stringify({ history: messages }),
    // });

    // const { followUps } = await followUpRes.json();

    // setFollowUps(followUps);

    return;
  }

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden min-w-full block">
      <ChatHistory />
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
