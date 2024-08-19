import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";
import { API_PATH } from "../utils/constants";
import { ChatResult, Chatbot, Message } from "../utils/types";

export default function useChat({
  chatbot,
  sessionId,
}: {
  chatbot: Chatbot;
  sessionId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [chat, setChat] = useState({});

  const fetchChatHistory = useCallback(async () => {
    if (!sessionId || !chatbot) return;

    axios({
      method: "get",
      baseURL: API_PATH,
      url: `/api/chat/${chatbot.id}/${sessionId}`,
    })
      .then((res) => {
        const { chat, messages, unseenMessagesCount } = res.data;

        const formattedMessages = messages.map((msg: Message) => ({
          ...msg,
          sender: msg.role === "user" ? "user" : "system",
          textResponse: msg.content,
          close: false,
        }));
        setMessages(formattedMessages);
        setPendingCount(unseenMessagesCount);
        setChat(chat);
        setLoading(false);
      })
      .catch((error) => {
        setMessages([]);
        setLoading(false);
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
  }, [sessionId, chatbot]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  const resetSession = useCallback(async () => {
    console.log("embedId", chatbot.id);
    console.log("sessionId", sessionId);
    return axios({
      method: "delete",
      baseURL: API_PATH,
      url: `/api/chat/${chatbot.id}/${sessionId}`,
    })
      .then(async () => {
        await fetchChatHistory();
        return true;
      })
      .catch((error) => {
        console.error("Error resetting session:", error);
        return false;
      });
  }, [chatbot, sessionId, fetchChatHistory]);

  return {
    pending: pendingCount,
    setPending: setPendingCount,
    chatHistory: messages,
    chat,
    setChatHistory: setMessages,
    loading,
    resetSession, // Return the resetSession function
  };
}

export async function streamChat({
  chatbot,
  chatHistory,
  setChatHistory,
  setLoadingResponse,
  chatbotId,
  sessionId,
}: {
  chatbot: Chatbot;
  chatHistory: Message[];
  setChatHistory: (messages: Message[]) => void;
  setLoadingResponse: (loading: boolean) => void;
  chatbotId: string;
  sessionId: string;
}): Promise<Message[]> {
  // return _chatHistory
  const ctrl = new AbortController();
  const URL_TEST = `${API_PATH}/api/chat/${chatbotId}/${sessionId}`;
  const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
  var _chatHistory = [...remHistory];

  // const promptMessage =
  //   chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;

  // if (!promptMessage || !promptMessage?.userMessage) {
  //   setLoadingResponse(false);
  //   return false;
  //   TODO - throw some error - this should never happen
  // }

  await fetchEventSource(URL_TEST, {
    method: "POST",
    body: JSON.stringify({
      chatbot,
      messages: remHistory.map((msg) => {
        return {
          id: msg.id,
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        };
      }),
    }),
    signal: ctrl.signal,
    openWhenHidden: true,

    async onopen(response) {
      if (response.ok) {
        return; // everything's good
      } else if (response.status >= 400) {
        await response
          .json()
          .then((serverResponse) => {
            handleChat({
              chatResult: serverResponse,
              setChatHistory,
              setLoadingResponse,
              remHistory,
              _chatHistory,
            });
          })
          .catch(() => {
            handleChat({
              chatResult: {
                uuid: v4(),
                type: "abort",
                textResponse: null,
                sources: [],
                close: true,
                error: `An error occurred while streaming response. Code ${response.status}`,
              },
              setChatHistory,
              setLoadingResponse,
              remHistory,
              _chatHistory,
            });
          });
        ctrl.abort();
        throw new Error();
      } else {
        handleChat({
          chatResult: {
            uuid: v4(),
            type: "abort",
            textResponse: null,
            sources: [],
            close: true,
            error: `An error occurred while streaming response. Unknown Error.`,
          },
          setChatHistory,
          setLoadingResponse,
          remHistory,
          _chatHistory,
        });
        ctrl.abort();
        throw new Error("Unknown Error");
      }
    },
    async onmessage(msg) {
      try {
        const chatResult = JSON.parse(msg.data);
        handleChat({
          chatResult,
          setChatHistory,
          setLoadingResponse,
          remHistory,
          _chatHistory,
        });
      } catch {}
    },
    onerror(err) {
      handleChat({
        chatResult: {
          uuid: v4(),
          type: "abort",
          textResponse: null,
          sources: [],
          close: true,
          error: `An error occurred while streaming response. ${err.message}`,
        },
        setChatHistory,
        setLoadingResponse,
        remHistory,
        _chatHistory,
      });
      ctrl.abort();
      throw new Error();
    },
  });

  return _chatHistory;
}

function handleChat({
  chatResult,
  setChatHistory,
  setLoadingResponse,
  remHistory,
  _chatHistory,
}: {
  chatResult: ChatResult;
  setChatHistory: (messages: Message[]) => void;
  setLoadingResponse: (loading: boolean) => void;
  remHistory: Message[];
  _chatHistory: Message[];
}) {
  const { uuid, textResponse, type, sources, error, close } = chatResult;
  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

  switch (type) {
    case "abort": {
      setLoadingResponse(false);
      setChatHistory([
        ...remHistory,
        {
          id: uuid,
          content: textResponse,
          role: "assistant",
          createdAt: formattedDate,
        },
      ]);
      _chatHistory.push({
        id: uuid,
        content: textResponse,
        role: "assistant",
        createdAt: formattedDate,
      });
      break;
    }
    case "textResponse": {
      setLoadingResponse(false);
      setChatHistory([
        ...remHistory,
        {
          id: uuid,
          content: textResponse,
          role: "assistant",
          createdAt: formattedDate,
        },
      ]);
      _chatHistory.push({
        id: uuid,
        content: textResponse,
        role: "assistant",
        createdAt: formattedDate,
      });
      break;
    }
    case "textResponseChunk": {
      const chatIdx = _chatHistory.findIndex((chat) => chat.id === uuid);

      if (chatIdx !== -1) {
        const existingHistory = { ..._chatHistory[chatIdx] };
        const updatedHistory = {
          ...existingHistory,
          content: (existingHistory.content ?? "") + (textResponse ?? ""),
          close,
        };
        _chatHistory[chatIdx] = updatedHistory;
      } else {
        _chatHistory.push({
          id: uuid,
          content: textResponse,
          role: "assistant",
          createdAt: formattedDate,
          close,
        });
      }
      setChatHistory([..._chatHistory]);
      break;
    }
    default:
      break;
  }
}
