import axios from "axios";
import { useEffect, useState } from "react";
import { API_PATH } from "../utils/constants";
import { Chatbot } from "../utils/types";

export default function useChatbot(chatbotId: string): Chatbot | null {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);

  useEffect(() => {
    axios({
      method: "get",
      baseURL: API_PATH,
      url: `/api/chatbot/${chatbotId}`,
    })
      .then((res) => {
        setChatbot(res.data.chatbot);
      })
      .catch((error) => {
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
  }, [chatbotId]);
  return chatbot;
}
