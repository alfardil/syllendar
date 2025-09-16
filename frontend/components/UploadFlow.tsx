"use client";

import FilePreview from "./FilePreview";
import FileUpload from "./FileUpload";
import EventsList from "./EventsList";
import StatusMessage from "./StatusMessage";
import { useFileUpload } from "../lib/hooks";

export default function UploadFlow() {
  const {
    selectedFile,
    preview,
    uploadStatus,
    extractedEvents,
    selectedEvents,
    fileType,
    isAnalyzing,
    isGenerating,
    analysisError,
    generationError,
    handleFileSelect,
    handleUpload,
    handleEventToggle,
    handleSelectAll,
    handleGenerateICS,
    clearFile,
  } = useFileUpload();

  return (
    <>
      {!selectedFile ? (
        <FileUpload onFileSelect={handleFileSelect} />
      ) : (
        <>
          <FilePreview
            file={selectedFile}
            preview={preview}
            fileType={fileType}
            onClear={clearFile}
            onUpload={handleUpload}
            isUploading={isAnalyzing}
          />

          {extractedEvents && (
            <EventsList
              extractedEvents={extractedEvents}
              selectedEvents={selectedEvents}
              onEventToggle={handleEventToggle}
              onSelectAll={handleSelectAll}
              onGenerateICS={handleGenerateICS}
              isGeneratingICS={isGenerating}
            />
          )}
        </>
      )}

      <StatusMessage
        uploadStatus={uploadStatus}
        analysisError={analysisError}
        generationError={generationError}
      />
    </>
  );
}
