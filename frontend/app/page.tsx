"use client";

import {
  Header,
  FileUpload,
  FilePreview,
  EventsList,
  StatusMessage,
  ChatBot,
} from "../components";
import { useFileUpload } from "../lib/hooks";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Header />

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "upload"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                📄 Upload Syllabus
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "chat"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                💬 Chat Assistant
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "upload" ? (
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
            ) : (
              <ChatBot />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
