import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";
import { API_PATH } from "../utils/constants";
import { Message, SSEMessage } from "../utils/types";

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
  const [chat, setChat] = useState<any | null>(null);
  // at the end of successful streamChat SSE - i.e got SSE message with streaming === false, initiate follow up questions, set followUps
  const [followUps, setFollowUps] = useState<string[]>([]); // reset at the beginning of streamChat?

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

  const streamChat = async ({
    message,
  }: {
    message: string;
  }): Promise<void> => {
    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const _messages = [
      ...messages,
      {
        id: v4(),
        content: message,
        role: "user",
        createdAt: formattedDate,
        streaming: false,
      },
    ];

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
                _messages,
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
                _messages,
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
            _messages,
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
            _messages,
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
          _messages,
        });
        ctrl.abort();
        throw new Error();
      },
    });
  };

  async function handleChat({
    sseMessage,
    _messages,
  }: {
    sseMessage: SSEMessage;
    _messages: RenderableMessage[];
  }) {
    const { id, textResponse, type, error, streaming } = sseMessage;
    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    switch (type) {
      case "abort": {
        setLoading(false);
        setMessages((prevMessages) => [
          ...prevMessages,
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
        const chatIdx = _messages.findIndex((chat) => chat.id === id);

        if (chatIdx !== -1) {
          const existingMessage = { ..._messages[chatIdx] };
          const updatedMessage = {
            ...existingMessage,
            content: (existingMessage.content ?? "") + (textResponse ?? ""),
            streaming,
          };
          _messages[chatIdx] = updatedMessage;
        } else {
          _messages.push({
            id,
            content: textResponse ?? "",
            role: "assistant",
            createdAt: formattedDate,
            updatedAt: formattedDate,
            streaming,
            error: undefined,
            loading: false,
          });
        }

        setMessages([..._messages]);
        if (!streaming) {
          await generateFollowUps({ messages: _messages });

          setLoading(false);
        }
        break;
      }
      default:
        break;
    }
  }

  async function generateFollowUps({
    messages,
  }: {
    messages: RenderableMessage[];
  }) {
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
