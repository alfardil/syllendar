"use client";
import { useRef, useEffect } from "react";
import { useChatBot } from "../lib/hooks";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatIcsDownload from "./ChatIcsDownload";
import ChatInput from "./ChatInput";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBot() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isGenerating,
    pendingIcsData,
    processMessage,
    downloadIcsFile,
  } = useChatBot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <ChatHeader />

      <ChatMessages
        messages={messages as Message[]}
        isGenerating={isGenerating}
      />

      <ChatIcsDownload
        pendingIcsData={pendingIcsData}
        isGenerating={isGenerating}
        onDownload={downloadIcsFile}
      />

      <ChatInput isGenerating={isGenerating} onSend={processMessage} />
    </div>
  );
}
