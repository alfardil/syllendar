"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ChatInputProps {
  isGenerating: boolean;
  onSend: (text: string) => Promise<void> | void;
}

export default function ChatInput({ isGenerating, onSend }: ChatInputProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    await onSend(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Label htmlFor="chat-input" className="sr-only">
            Chat message
          </Label>
          <Input
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your schedule changes..."
            className="w-full"
            disabled={isGenerating}
            aria-label="Chat message"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!inputText.trim() || isGenerating}
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Example: &quot;Change my Tuesday class from 2pm to 3pm&quot; or
        &quot;Add a study session on Friday at 6pm&quot;
      </p>
    </div>
  );
}
