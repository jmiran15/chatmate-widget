import { useState, useEffect } from "react";
import ChatHistory from "./chat-history";
import PromptInput from "./prompt-input";
import { streamChat } from "../hooks/use-chat";
import { API_PATH } from "../utils/constants";
import { format } from "date-fns";

export default function ChatContainer({
  sessionId,
  knownHistory = [],
  chatbot,
  chatbotId,
  setPendingCount,
}) {
  const [message, setMessage] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState(knownHistory);

  // Resync history if the ref to known history changes
  // eg: cleared.
  useEffect(() => {
    if (knownHistory.length !== chatHistory.length)
      setChatHistory([...knownHistory]);
  }, [knownHistory]);

  const showInitalStarterQuestions =
    chatHistory.length <= chatbot.introMessages.length;

  const [followUps, setFollowUps] = useState(
    showInitalStarterQuestions ? chatbot?.starterQuestions : []
  );

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message || message === "") return false;

    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const prevChatHistory = [
      ...chatHistory,
      { content: message, role: "user", createdAt: formattedDate },
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true,
        createdAt: formattedDate,
      },
    ];

    setChatHistory(prevChatHistory);
    setMessage("");
    setLoadingResponse(true);
  };

  useEffect(() => {
    // this is where we call our api for a chat response
    async function fetchReply() {
      const promptMessage =
        chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;

      if (!promptMessage || !promptMessage?.userMessage) {
        setLoadingResponse(false);
        return false;
      }

      if (loadingResponse) setFollowUps([]);

      const _chatHistory = await streamChat({
        chatbot,
        chatHistory,
        setChatHistory,
        setLoadingResponse,
        chatbotId,
        sessionId,
      });

      const followUpRes = await fetch(`${API_PATH}/api/generatefollowups`, {
        method: "POST",
        body: JSON.stringify({ history: _chatHistory }),
      });

      const { followUps } = await followUpRes.json();

      setFollowUps(followUps);

      return;
    }
    loadingResponse === true && fetchReply();
  }, [loadingResponse, chatHistory]);

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden min-w-full block">
      <ChatHistory
        history={chatHistory}
        chatbot={chatbot}
        followUps={followUps}
        submit={handleSubmit}
        setMessage={setMessage}
        setPendingCount={setPendingCount}
      />
      <PromptInput
        message={message}
        submit={handleSubmit}
        onChange={handleMessageChange}
        inputDisabled={loadingResponse}
        buttonDisabled={loadingResponse}
        chatbot={chatbot}
      />
    </div>
  );
}
