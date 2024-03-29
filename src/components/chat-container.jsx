import React, { useState, useEffect, useRef } from "react";
import ChatHistory from "./chat-history";
import PromptInput from "./prompt-input";
import handleChat from "@/utils/chat";
import ChatService from "@/models/chatService";

export default function ChatContainer({
  sessionId,
  embedId,
  knownHistory = [],
  chatbot,
  chatbotId,
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

    const prevChatHistory = [
      ...chatHistory,
      { content: message, role: "user" },
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true,
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
      const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
      var _chatHistory = [...remHistory];

      if (!promptMessage || !promptMessage?.userMessage) {
        setLoadingResponse(false);
        return false;
      }

      if (loadingResponse) setFollowUps([]);

      await ChatService.streamChat(
        chatbot,
        remHistory,
        chatbotId,
        sessionId,
        (chatResult) =>
          handleChat(
            chatResult,
            setLoadingResponse,
            setChatHistory,
            remHistory,
            _chatHistory
          )
      );

      const followUpRes = await fetch(
        `https://chatmate.fly.dev/api/generatefollowups`,
        {
          method: "POST",
          body: JSON.stringify({ history: _chatHistory }),
        }
      );

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
