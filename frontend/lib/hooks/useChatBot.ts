import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useIcsGeneration } from "./index";
import {
  sendChatMessage,
  sendChatMessageStream,
  ChatResponse,
} from "@/app/services/chatApi";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "Hi! I'm your schedule assistant. What would you like help with?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [pendingIcsData, setPendingIcsData] = useState<any>(null);

  const {
    generateIcs,
    isGenerating,
    error: generationError,
  } = useIcsGeneration();

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    addMessage(text.trim(), true);

    try {
      const aiMessageId = uuidv4();
      const aiMessage: Message = {
        id: aiMessageId,
        text: "",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      let displayText = "";
      try {
        for await (const data of sendChatMessageStream(text, messages)) {
          if (data.chunk) {
            displayText += data.chunk;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, text: displayText } : msg
              )
            );
          } else if (data.ics_data) {
            setPendingIcsData(data.ics_data);
            addMessage(
              "ICS file is ready! You can download it using the button below.",
              false
            );
          }
        }
      } catch (streamError) {
        console.error(
          "Streaming error, falling back to regular chat:",
          streamError
        );
        const response: ChatResponse = await sendChatMessage(text, messages);
        displayText = response.response;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: displayText } : msg
          )
        );

        return;
      }
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage(
        "Sorry, I'm having trouble processing your message. Please try again.",
        false
      );
    }
  };

  const downloadIcsFile = async () => {
    if (pendingIcsData) {
      try {
        await generateIcs(pendingIcsData);
        setPendingIcsData(null);
      } catch (error) {
        console.error("Error downloading ICS file:", error);
      }
    }
  };

  return {
    messages,
    isGenerating,
    generationError,
    pendingIcsData,
    processMessage,
    addMessage,
    downloadIcsFile,
  };
}
