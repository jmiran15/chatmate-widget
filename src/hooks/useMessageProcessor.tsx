import { useCallback, useEffect, useRef } from "react";
import { Message } from "../utils/types";

interface UseMessageProcessorProps {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setFollowUps: React.Dispatch<React.SetStateAction<any[]>>;
  messages: Message[];
}

export function useMessageProcessor({
  setMessages,
  setFollowUps,
  messages,
}: UseMessageProcessorProps) {
  const messageQueueRef = useRef<Message[]>([]);
  const isProcessingRef = useRef(false);

  const processQueue = useCallback(() => {
    isProcessingRef.current = true;
    const addMessageToState = ({ message }: { message: Message }) => {
      console.log("addMessageToState", message);
      setMessages((prevThread) => {
        const newMessageTime = new Date(message.createdAt).getTime();

        // Check if the message already exists
        const existingIndex = prevThread.findIndex((m) => m.id === message.id);
        if (existingIndex !== -1) {
          // Update existing message
          const updatedThread = [...prevThread];
          updatedThread[existingIndex] = {
            ...updatedThread[existingIndex],
            ...message,
            seenByAgent: updatedThread[existingIndex].seenByAgent,
            seenByUser: updatedThread[existingIndex].seenByUser,
            seenByUserAt:
              updatedThread[existingIndex].seenByUserAt || message.seenByUserAt,
            createdAt: updatedThread[existingIndex].createdAt,
            updatedAt: new Date(message.updatedAt),
          };
          return updatedThread;
        }

        // Find the correct insertion position
        let insertIndex = prevThread.length;
        for (let i = prevThread.length - 1; i >= 0; i--) {
          const currentMessageTime = new Date(
            prevThread[i].createdAt
          ).getTime();
          if (currentMessageTime <= newMessageTime) {
            insertIndex = i + 1;
            break;
          }
        }

        // Insert the new message at the correct position
        const updatedThread = [...prevThread];
        updatedThread.splice(insertIndex, 0, {
          ...message,
          createdAt: new Date(message.createdAt),
          updatedAt: new Date(message.updatedAt),
        });
        return updatedThread;
      });
    };

    const message = messageQueueRef.current.shift();
    if (!message) return;

    addMessageToState({
      message: {
        ...message,
        createdAt: new Date(message.createdAt),
        updatedAt: new Date(message.updatedAt),
      },
    });

    if (message.delay) {
      console.log("Setting timeout");
      setTimeout(() => {
        addMessageToState({
          message: {
            ...message,
            delay: undefined,
            loading: false,
            streaming: false,
          },
        });
        isProcessingRef.current = false;
      }, message.delay * 1000);
    } else {
      isProcessingRef.current = false;
    }

    setFollowUps([]);
  }, [setMessages, setFollowUps]);

  useEffect(() => {
    if (messageQueueRef.current.length > 0 && !isProcessingRef.current) {
      processQueue();
    }
  }, [messages, processQueue]);

  const addMessageToQueue = (newMessage: Message) => {
    console.log("newMessage", newMessage);
    messageQueueRef.current.push(newMessage);
    // processQueue();
    if (messageQueueRef.current.length > 0 && !isProcessingRef.current) {
      processQueue();
    }
  };

  return {
    addMessageToQueue,
  };
}
