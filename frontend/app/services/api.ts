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

    const response = await fetch(`${API_BASE_URL}/generate/analyze-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze PDF: ${response.statusText}`);
    }

    return response.json();
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
