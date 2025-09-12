import { useMutation } from "@tanstack/react-query";
import { api, Event } from "../../app/services/api";

interface IcsGenerationData {
  course_name: string;
  course_code: string;
  events: Event[];
}

export const useIcsGeneration = () => {
  const mutation = useMutation({
    mutationFn: api.generateIcs,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedule.ics";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error("ICS generation error:", error);
    },
  });

  const generateIcs = (data: IcsGenerationData) => {
    return mutation.mutateAsync(data);
  };

  return {
    generateIcs,
    isGenerating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
