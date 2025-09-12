import { useState } from "react";
import { useIcsGeneration } from "./index";
import { sendChatMessage, ChatResponse } from "@/app/services/chatApi";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your schedule assistant. You can talk to me naturally about any schedule changes you need. For example, you can say 'My exam got moved to September 12 at 3pm' or 'Add a study session on Friday at 6pm'. What would you like to do?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingIcsData, setPendingIcsData] = useState<any>(null);

  const {
    generateIcs,
    isGenerating,
    error: generationError,
    reset: resetGeneration,
  } = useIcsGeneration();

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const simulateTyping = async (response: string) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsTyping(false);
    addMessage(response, false);
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    addMessage(text.trim(), true);

    try {
      // Call the AI backend with conversation history
      const response: ChatResponse = await sendChatMessage(text, messages);

      // Add AI response
      await simulateTyping(response.response);

      // If the AI wants to generate an ICS file, store it for download
      if (response.action === "generate_ics" && response.ics_data) {
        // Store the ICS data for potential download
        setPendingIcsData(response.ics_data);
        await simulateTyping(
          "✅ ICS file is ready! You can download it using the button below."
        );
      }
    } catch (error) {
      await simulateTyping(
        "❌ Sorry, I'm having trouble processing your message. Please try again."
      );
    }
  };

  const downloadIcsFile = async () => {
    if (pendingIcsData) {
      try {
        await generateIcs(pendingIcsData);
        setPendingIcsData(null); // Clear after successful download
      } catch (error) {
        console.error("Error downloading ICS file:", error);
      }
    }
  };

  return {
    messages,
    isTyping,
    isGenerating,
    generationError,
    pendingIcsData,
    processMessage,
    addMessage,
    downloadIcsFile,
  };
}
