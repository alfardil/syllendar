"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [extractedEvents, setExtractedEvents] = useState<any>(null);
  const [isGeneratingICS, setIsGeneratingICS] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return dateTimeString; // fallback to original string if parsing fails
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus("Uploading and analyzing image...");
    setExtractedEvents(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://localhost:8000/generate/analyze-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const eventsData = await response.json();
        setExtractedEvents(eventsData);
        setUploadStatus(
          "✅ Image analyzed successfully! Review the events below."
        );
      } else {
        setUploadStatus("❌ Error processing image. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("❌ Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateICS = async () => {
    if (!extractedEvents) return;

    setIsGeneratingICS(true);
    setUploadStatus("Generating ICS file...");

    try {
      const response = await fetch(
        "http://localhost:8000/generate/generate-ics",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(extractedEvents),
        }
      );

      if (response.ok) {
        // Get the ICS file as blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "schedule.ics";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setUploadStatus("✅ ICS file generated and downloaded successfully!");
      } else {
        setUploadStatus("❌ Error generating ICS file. Please try again.");
      }
    } catch (error) {
      console.error("ICS generation error:", error);
      setUploadStatus("❌ Error generating ICS file. Please try again.");
    } finally {
      setIsGeneratingICS(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setUploadStatus("");

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadStatus("");
    setExtractedEvents(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Syllendar
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Upload a syllabus image and get an ICS calendar file
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Drop your syllabus image here
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      or click to browse files
                    </p>
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Supports JPG, PNG, GIF, and other image formats
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-700 rounded-lg"
                    />
                  )}
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Selected: {selectedFile.name}
                  </p>

                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                  >
                    {isUploading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Analyze Image"
                    )}
                  </button>
                </div>

                {/* Extracted Events Display */}
                {extractedEvents && (
                  <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Extracted Events
                    </h3>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">
                        {extractedEvents.course_name} (
                        {extractedEvents.course_code})
                      </h4>
                    </div>

                    <div className="space-y-3 mb-6">
                      {extractedEvents.events?.map(
                        (event: any, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-white dark:bg-gray-600 rounded border"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {event.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {formatDateTime(event.start_time)} -{" "}
                                  {formatDateTime(event.end_time)}
                                </p>
                                {event.location && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    📍 {event.location}
                                  </p>
                                )}
                                {event.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {event.description}
                                  </p>
                                )}
                                {event.recurrence && (
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    🔄 {event.recurrence} on{" "}
                                    {event.days?.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleGenerateICS}
                        disabled={isGeneratingICS}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                      >
                        {isGeneratingICS ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating ICS...</span>
                          </div>
                        ) : (
                          "Generate ICS File"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadStatus && (
              <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-center text-sm">{uploadStatus}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
