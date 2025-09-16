const API_BASE_URL = "http://localhost:8000";

export interface Event {
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
  event_type?: string;
  recurrence?: string;
  days?: string[];
}

export interface ExtractedEvents {
  course_name: string;
  course_code: string;
  events: Event[];
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ExtractedEvents;
  error?: string;
}

export const api = {
  async analyzeImage(file: File): Promise<ExtractedEvents> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/generate/analyze-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze image: ${response.statusText}`);
    }

    return response.json();
  },

  async analyzePdf(file: File): Promise<ExtractedEvents> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/pdf/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze PDF: ${response.statusText}`);
    }

    return response.json();
  },

  async *analyzePdfStream(
    file: File,
    onStatus?: (status: string, message?: string) => void,
    onProgress?: (chunk: string) => void
  ): AsyncGenerator<
    {
      status: string;
      data?: ExtractedEvents;
      message?: string;
      chunk?: string;
    },
    void,
    unknown
  > {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/pdf/analyze-stream`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze PDF: ${response.statusText}`);
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

              if (data.status === "analyzing") {
                onStatus?.(data.status, data.message);
                yield { status: data.status, message: data.message };
              } else if (data.status === "streaming") {
                onProgress?.(data.chunk);
                yield { status: data.status, chunk: data.chunk };
              } else if (data.status === "complete") {
                yield { status: data.status, data: data.data };
                return;
              } else if (data.status === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  async generateIcs(eventsData: {
    course_name: string;
    course_code: string;
    events: Event[];
  }): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/generate/generate-ics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventsData),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ICS: ${response.statusText}`);
    }

    return response.blob();
  },
};
