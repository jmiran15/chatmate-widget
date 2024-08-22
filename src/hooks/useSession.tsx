import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";
import { API_PATH } from "../utils/constants";
import { Message, SSEMessage } from "../utils/types";
import { useIsAgent } from "./useIsAgent";

export type RenderableMessage = Message & {
  streaming: boolean;
  loading?: boolean;
  error?: string;
};

export type StreamChatRequest = {
  messages: Message[];
  chattingWithAgent: boolean;
};

export default function useSession({
  embedId,
  sessionId,
}: {
  embedId: string;
  sessionId: string;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<RenderableMessage[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const { isAgent } = useIsAgent({ sessionId });
  const [chat, setChat] = useState<any | null>(null);

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
          error: null,
          loading: false,
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

  console.log("messages", messages);

  const streamChat = async ({
    message,
  }: {
    message: string;
  }): Promise<void> => {
    const ctrl = new AbortController();

    await fetchEventSource(`${API_PATH}/api/chat/${embedId}/${sessionId}`, {
      method: "POST",
      body: JSON.stringify({
        messages: [
          ...messages.map((message: RenderableMessage) => ({
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
          return;
        } else if (response.status >= 400) {
          await response
            .json()
            .then((serverResponse) => {
              handleChat({
                sseMessage: serverResponse,
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
              });
            });
          ctrl.abort();
          throw new Error();
        } else {
          handleChat({
            sseMessage: {
              id: v4(),
              type: "abort",
              textResponse: null,
              streaming: false,
              error: `An error occurred while streaming response. Unknown Error.`,
            },
          });
          ctrl.abort();
          throw new Error("Unknown Error");
        }
      },
      async onmessage(msg) {
        try {
          const sseMessage = JSON.parse(msg.data);
          handleChat({
            sseMessage,
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
        });
        ctrl.abort();
        throw new Error();
      },
    });
  };

  function handleChat({ sseMessage }: { sseMessage: SSEMessage }) {
    const { id, textResponse, type, error, streaming } = sseMessage;
    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    switch (type) {
      case "abort": {
        setLoading(false);
        setMessages((messages) => [
          ...messages,
          {
            id,
            content: "",
            error: error ?? undefined,
            role: "assistant",
            createdAt: formattedDate,
            updatedAt: formattedDate,
            streaming,
            loading: false,
          },
        ]);

        break;
      }
      case "textResponseChunk": {
        // console.log("textResponseChunk", sseMessage, messages);
        const chatIdx = messages.findIndex((chat) => chat.id === id);

        if (chatIdx !== -1) {
          console.log(
            "updating message textResponseChunk",
            sseMessage,
            messages
          );
          const existingMessage = { ...messages[chatIdx] };
          const updatedMessage = {
            ...existingMessage,
            content: (existingMessage.content ?? "") + (textResponse ?? ""),
            streaming,
          };
          setMessages(
            messages.map((msg, idx) => (idx === chatIdx ? updatedMessage : msg))
          );
        } else {
          console.log(
            "creating message textResponseChunk",
            sseMessage,
            messages
          );

          setMessages((messages) => [
            ...messages,
            {
              id,
              content: textResponse,
              role: "assistant",
              createdAt: formattedDate,
              updatedAt: formattedDate,
              streaming,
              error: undefined,
              loading: false,
            },
          ]);
        }

        if (!streaming) {
          setLoading(false);
        }
        break;
      }
      default:
        break;
    }
  }

  return {
    isAgent,
    sessionId,
    loading,
    messages,
    setMessages,
    pendingCount,
    setPendingCount,
    resetSession,
    streamChat,
    chat,
  };
}
