import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useFileAnalysis, useIcsGeneration } from "./index";
import { ExtractedEvents, Event } from "@/app/services/api";

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [extractedEvents, setExtractedEvents] =
    useState<ExtractedEvents | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    analyzeFile,
    isAnalyzing,
    error: analysisError,
    reset: resetAnalysis,
  } = useFileAnalysis();

  const {
    generateIcs,
    isGenerating,
    error: generationError,
    reset: resetGeneration,
  } = useIcsGeneration();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus("");
    setExtractedEvents(null);
    setSelectedEvents(new Set());

    if (file.type.startsWith("image/")) {
      setFileType("image");
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      setFileType("pdf");
      // Create object URL for PDF preview
      const pdfUrl = URL.createObjectURL(file);
      setPreview(pdfUrl);
    } else {
      setFileType(null);
      setPreview(null);
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileType) return;

    setUploadStatus(`Uploading and analyzing ${fileType}...`);
    setExtractedEvents(null);
    setSelectedEvents(new Set());
    resetAnalysis();

    try {
      const eventsData = await analyzeFile(selectedFile);
      setExtractedEvents(eventsData);
      setUploadStatus(
        `✅ ${fileType.toUpperCase()} analyzed successfully! Review and select the events below.`
      );
    } catch {
      setUploadStatus(`❌ Error processing ${fileType}. Please try again.`);
    }
  };

  const handleEventToggle = (index: number) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEvents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEvents.size === extractedEvents?.events?.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(
        new Set(
          extractedEvents?.events?.map((_: Event, index: number) => index) || []
        )
      );
    }
  };

  const handleGenerateICS = async () => {
    if (!extractedEvents) return;

    setUploadStatus("Generating ICS file...");
    resetGeneration();

    try {
      const eventsToInclude =
        selectedEvents.size > 0
          ? extractedEvents.events.filter((_: Event, index: number) =>
              selectedEvents.has(index)
            )
          : extractedEvents.events;

      const eventsData = {
        course_name: extractedEvents.course_name,
        course_code: extractedEvents.course_code,
        events: eventsToInclude,
      };

      await generateIcs(eventsData);
      setUploadStatus("✅ ICS file generated and downloaded successfully!");
    } catch {
      setUploadStatus("❌ Error generating ICS file. Please try again.");
    }
  };

  // Cleanup PDF URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (preview && fileType === "pdf") {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, fileType]);

  const clearFile = () => {
    // Clean up PDF URL if it exists
    if (preview && fileType === "pdf") {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(null);
    setPreview(null);
    setUploadStatus("");
    setExtractedEvents(null);
    setSelectedEvents(new Set());
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    // State
    selectedFile,
    preview,
    uploadStatus,
    extractedEvents,
    selectedEvents,
    fileType,
    fileInputRef,
    isAnalyzing,
    isGenerating,
    analysisError,
    generationError,

    // Actions
    handleFileSelect,
    handleFileInputChange,
    handleUpload,
    handleEventToggle,
    handleSelectAll,
    handleGenerateICS,
    clearFile,
  };
}
