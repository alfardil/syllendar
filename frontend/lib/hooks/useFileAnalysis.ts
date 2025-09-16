import { useMutation } from "@tanstack/react-query";
import { api, ExtractedEvents } from "../../app/services/api";

export const useFileAnalysis = () => {
  const analyzeImageMutation = useMutation({
    mutationFn: api.analyzeImage,
    onError: (error) => {
      console.error("Image analysis error:", error);
    },
  });

  const analyzePdfMutation = useMutation({
    mutationFn: api.analyzePdf,
    onError: (error) => {
      console.error("PDF analysis error:", error);
    },
  });

  const analyzeFile = async (file: File): Promise<ExtractedEvents> => {
    if (file.type.startsWith("image/")) {
      return analyzeImageMutation.mutateAsync(file);
    } else if (file.type === "application/pdf") {
      return analyzePdfMutation.mutateAsync(file);
    } else {
      throw new Error("Unsupported file type");
    }
  };

  const analyzePdfWithStream = async (
    file: File,
    onStatus?: (status: string, message?: string) => void,
    onProgress?: (chunk: string) => void
  ): Promise<ExtractedEvents> => {
    try {
      for await (const result of api.analyzePdfStream(
        file,
        onStatus,
        onProgress
      )) {
        if (result.status === "complete" && result.data) {
          return result.data;
        }
      }
      throw new Error("No data received from streaming analysis");
    } catch (error) {
      console.error("PDF streaming analysis error:", error);
      // Fallback to regular PDF analysis
      return analyzePdfMutation.mutateAsync(file);
    }
  };

  return {
    analyzeFile,
    analyzePdfWithStream,
    isAnalyzing: analyzeImageMutation.isPending || analyzePdfMutation.isPending,
    error: analyzeImageMutation.error || analyzePdfMutation.error,
    reset: () => {
      analyzeImageMutation.reset();
      analyzePdfMutation.reset();
    },
  };
};
