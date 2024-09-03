import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { type Socket } from "socket.io-client";
import { v4 } from "uuid";
import { API_PATH } from "../utils/constants";
import { Message, SSEMessage } from "../utils/types";
import { useIsAgent } from "./useIsAgent";

export type StreamChatRequest = {
  messages: Message[];
  chattingWithAgent: boolean;
};

export default function useSession({
  embedId,
  sessionId,
  socket,
}: {
  embedId: string;
  sessionId: string;
  socket: Socket | undefined;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [chat, setChat] = useState<any | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const { isAgent } = useIsAgent({ chatId: chat?.id, socket });

  const fetchSessionMessages = useCallback(async () => {
    if (!sessionId || !embedId) return;

    axios({
      method: "get",
      baseURL: API_PATH,
      url: `/api/chat/${embedId}/${sessionId}`,
    })
      .then((res) => {
        const { chat, messages, unseenMessagesCount } = res.data;

        const formattedMessages = messages.map((msg: Message) => ({
          ...msg,
          streaming: false,
          error: undefined,
          loading: false,
          createdAt: new Date(msg.createdAt),
          updatedAt: new Date(msg.updatedAt),
          seenByUserAt: msg.seenByUserAt
            ? new Date(msg.seenByUserAt)
            : undefined,
        }));

        console.log({
          messages,
          unseenMessagesCount,
        });

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
  }, [sessionId, embedId]);

  useEffect(() => {
    fetchSessionMessages();
  }, [fetchSessionMessages]);

  const resetSession = useCallback(async () => {
    return axios({
      method: "delete",
      baseURL: API_PATH,
      url: `/api/chat/${embedId}/${sessionId}`,
    })
      .then(async () => {
        await fetchSessionMessages();
        return true;
      })
      .catch((error) => {
        console.error("Error resetting session:", error);
        return false;
      });
  }, [embedId, sessionId, fetchSessionMessages]);

  const streamChat = async ({
    message,
  }: {
    message: string;
  }): Promise<void> => {
    const currentDate = new Date();
    const newUserMessage = {
      id: v4(),
      chatId: chat?.id,
      content: message,
      role: "user",
      createdAt: currentDate,
      updatedAt: currentDate,
      streaming: false,
      loading: false,
      error: null,
    } as Message;

    const dummyId = v4();

    const dummyAssistantMessage = {
      id: dummyId,
      chatId: chat?.id,
      createdAt: currentDate,
      updatedAt: currentDate,
      role: "assistant",
      content: "",
      streaming: true,
      loading: true,
      seenByAgent: true,
    } as Message;

    setMessages((prevMessages) => [
      ...prevMessages,
      newUserMessage,
      dummyAssistantMessage,
    ]);
    setFollowUps([]);

    const ctrl = new AbortController();

    await fetchEventSource(`${API_PATH}/api/chat/${embedId}/${sessionId}`, {
      method: "POST",
      body: JSON.stringify({
        messages: [
          ...messages.map((message: Message) => ({
            role: message.role,
            content: message.content,
          })),
          {
            role: "user",
            content: message,
          },
        ],
        chattingWithAgent: false,
      } as StreamChatRequest),
      signal: ctrl.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok) {
          if (socket) {
            socket.emit("new message", {
              chatId: chat?.id,
              message: newUserMessage,
            });
          }
          return;
        } else if (response.status >= 400) {
          await response
            .json()
            .then((serverResponse) => {
              handleChat({
                sseMessage: serverResponse,
                dummyId,
              });
            })
            .catch(() => {
              handleChat({
                sseMessage: {
                  id: v4(),
                  type: "abort",
                  textResponse: null,
                  streaming: false,
                  error: `An error occurred while streaming response. Code ${response.status}`,
                },
                dummyId,
              });
            });
          ctrl.abort();
          throw new Error();
        } else {
          await handleChat({
            sseMessage: {
              id: v4(),
              type: "abort",
              textResponse: null,
              streaming: false,
              error: `An error occurred while streaming response. Unknown Error.`,
            },
            dummyId,
          });
          ctrl.abort();
          throw new Error("Unknown Error");
        }
      },
      async onmessage(msg) {
        try {
          const sseMessage = JSON.parse(msg.data);
          await handleChat({
            sseMessage,
            dummyId,
          });
        } catch {}
      },
      onerror(err) {
        handleChat({
          sseMessage: {
            id: v4(),
            type: "abort",
            textResponse: null,
            streaming: false,
            error: `An error occurred while streaming response. ${err.message}`,
          },
          dummyId,
        });
        ctrl.abort();
        throw new Error();
      },
    });
  };

  async function handleChat({
    sseMessage,
    dummyId,
  }: {
    sseMessage: SSEMessage;
    dummyId: string;
  }) {
    const { id, textResponse, type, error, streaming } = sseMessage;
    const currentDate = new Date();

    const removeDummyMessage = (messages: Message[]) =>
      messages.filter((msg) => msg.id !== dummyId);

    switch (type) {
      case "abort": {
        setLoading(false);
        setMessages((prevMessages) => [
          ...removeDummyMessage(prevMessages),
          {
            id,
            createdAt: currentDate,
            updatedAt: currentDate,
            role: "assistant",
            content: "",
            chatId: chat?.id,
            error: error,
            streaming: false,
            loading: false,
          },
        ]);
        break;
      }
      case "textResponseChunk": {
        setMessages((prevMessages) => {
          const updatedMessages = removeDummyMessage(prevMessages);
          const existingIndex = updatedMessages.findIndex(
            (msg) => msg.id === id
          );

          if (existingIndex !== -1) {
            updatedMessages[existingIndex] = {
              ...updatedMessages[existingIndex],
              content:
                (updatedMessages[existingIndex].content ?? "") +
                (textResponse ?? ""),
              streaming,
              loading: false,
            };
          } else {
            updatedMessages.push({
              id,
              chatId: chat?.id,
              content: textResponse ?? "",
              role: "assistant",
              createdAt: currentDate,
              updatedAt: currentDate,
              streaming,
              error: null,
              loading: false,
              seenByAgent: true,
            });
          }

          return updatedMessages;
        });

        if (!streaming) {
          if (socket) {
            setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              socket.emit("new message", {
                chatId: chat?.id,
                message: lastMessage,
              });
              return prevMessages;
            });
          }

          if (!isAgent) {
            setMessages((prevMessages) => {
              generateFollowUps({ messages: prevMessages });
              return prevMessages;
            });
          }

          setLoading(false);
        }
        break;
      }
      default:
        // In case of unknown message type, remove dummy message as a precaution
        setMessages(removeDummyMessage);
        break;
    }
  }

  async function generateFollowUps({ messages }: { messages: Message[] }) {
    const followUpRes = await fetch(`${API_PATH}/api/generatefollowups`, {
      method: "POST",
      body: JSON.stringify({
        history: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    const { followUps } = await followUpRes.json();
    return setFollowUps(followUps);
  }

  const recalculatePendingCount = useCallback((): void => {
    const unseenMessagesCount = messages.filter((msg) => {
      console.log(`${msg.content} - ${msg.seenByUser}\n`);
      return !msg.seenByUser && msg.role !== "user";
    }).length;
    setPendingCount(unseenMessagesCount);
  }, [messages]);

  useEffect(() => {
    recalculatePendingCount();
  }, [recalculatePendingCount]);

  return {
    sessionId,
    loading,
    messages,
    setMessages,
    pendingCount,
    setPendingCount,
    resetSession,
    streamChat,
    chat,
    followUps,
    setFollowUps,
  };
}
