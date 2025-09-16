"use client";
import { useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isGenerating: boolean;
}

export default function ChatMessages({
  messages,
  isGenerating,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const visibleMessages = messages.filter(
    (m) => m.isUser || m.text.trim() !== ""
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {visibleMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.isUser
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ))}

      {isGenerating && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
