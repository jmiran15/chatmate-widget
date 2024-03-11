import { fetchEventSource } from "@microsoft/fetch-event-source";
import { v4 } from "uuid";

const ChatService = {
  embedSessionHistory: async function (embedSettings, sessionId) {
    // this loads in all the messages form the chat history

    const { embedId } = embedSettings;
    const URL_TEST = `https://chatmate.fly.dev/api/chat/${embedId}/${sessionId}`;

    return await fetch(URL_TEST)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Invalid response from server");
      })
      .then((res) => {
        console.log("res", res);
        return res.map((msg) => ({
          ...msg,
          id: v4(),
          sender: msg.role === "user" ? "user" : "system",
          textResponse: msg.content,
          close: false,
        }));
      })
      .catch((e) => {
        console.error(e);
        return [];
      });
  },
  resetEmbedChatSession: async function (embedSettings, sessionId) {
    // we probably don't want to delete on the backend when someone resets the chat
    // just delete all the messages in the chat on backend, but dont delete the chat

    const { embedId } = embedSettings;
    const URL_TEST = `https://chatmate.fly.dev/api/chat/${embedId}/${sessionId}`;

    return await fetch(URL_TEST, {
      method: "DELETE",
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
  streamChat: async function (
    chatbot,
    remHistory,
    chatbotId,
    sessionId,
    embedSettings,
    message,
    handleChat
  ) {
    const ctrl = new AbortController();

    // CHANGE THIS URL TO BE THE URL OF MY API

    console.log("remHistory", remHistory);

    const URL_TEST = `https://chatmate.fly.dev/api/chat/${chatbotId}/${sessionId}`;
    await fetchEventSource(URL_TEST, {
      method: "POST",
      body: JSON.stringify({
        chatbot,
        messages: remHistory.map((msg) => {
          return {
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          };
        }),
      }),
      signal: ctrl.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok) {
          console.log("response", response);
          return; // everything's good
        } else if (response.status >= 400) {
          await response
            .json()
            .then((serverResponse) => {
              handleChat(serverResponse);
            })
            .catch(() => {
              handleChat({
                id: v4(),
                type: "abort",
                textResponse: null,
                sources: [],
                close: true,
                error: `An error occurred while streaming response. Code ${response.status}`,
              });
            });
          ctrl.abort();
          throw new Error();
        } else {
          handleChat({
            id: v4(),
            type: "abort",
            textResponse: null,
            sources: [],
            close: true,
            error: `An error occurred while streaming response. Unknown Error.`,
          });
          ctrl.abort();
          throw new Error("Unknown Error");
        }
      },
      async onmessage(msg) {
        console.log("msg", msg);
        try {
          const chatResult = JSON.parse(msg.data);
          console.log("chatResult", chatResult);
          handleChat(chatResult);
        } catch {}
      },
      onerror(err) {
        handleChat({
          id: v4(),
          type: "abort",
          textResponse: null,
          sources: [],
          close: true,
          error: `An error occurred while streaming response. ${err.message}`,
        });
        ctrl.abort();
        throw new Error();
      },
    });
  },
};

export default ChatService;
