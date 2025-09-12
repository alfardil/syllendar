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

  return {
    analyzeFile,
    isAnalyzing: analyzeImageMutation.isPending || analyzePdfMutation.isPending,
    error: analyzeImageMutation.error || analyzePdfMutation.error,
    reset: () => {
      analyzeImageMutation.reset();
      analyzePdfMutation.reset();
    },
  };
};
