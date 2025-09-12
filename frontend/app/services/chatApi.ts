const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatResponse {
  action: "chat" | "generate_ics";
  response: string;
  ics_data?: {
    course_name: string;
    course_code: string;
    events: Array<{
      title: string;
      start_time: string;
      end_time: string;
      location?: string;
      description?: string;
      event_type?: string;
    }>;
  };
}

export async function sendChatMessage(
  message: string,
  conversationHistory?: Array<{
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>
): Promise<ChatResponse> {
  try {
    const formData = new FormData();
    formData.append("message", message);

    if (conversationHistory && conversationHistory.length > 0) {
      formData.append(
        "conversation_history",
        JSON.stringify(conversationHistory)
      );
    }

    const response = await fetch(`${API_BASE_URL}/generate/chat`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to send chat message");
  }
}
