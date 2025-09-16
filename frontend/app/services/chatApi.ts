const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8000";

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

export async function* sendChatMessageStream(
  message: string,
  conversationHistory?: Array<{
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>
): AsyncGenerator<
  { chunk?: string; ics_data?: ChatResponse["ics_data"]; done?: boolean },
  void,
  unknown
> {
  try {
    const formData = new FormData();
    formData.append("message", message);

    if (conversationHistory && conversationHistory.length > 0) {
      formData.append(
        "conversation_history",
        JSON.stringify(conversationHistory)
      );
    }

    const response = await fetch(`${API_BASE_URL}/generate/chat-stream`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                yield { chunk: data.chunk };
              } else if (data.ics_data) {
                yield { ics_data: data.ics_data };
              } else if (data.done) {
                return;
              }
            } catch {
              console.warn("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Error in streaming chat:", error);
    throw new Error("Failed to stream chat message");
  }
}
