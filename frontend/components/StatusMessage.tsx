interface StatusMessageProps {
  uploadStatus?: string;
  analysisError?: Error | null;
  generationError?: Error | null;
}

export default function StatusMessage({
  uploadStatus,
  analysisError,
  generationError,
}: StatusMessageProps) {
  if (!uploadStatus && !analysisError && !generationError) {
    return null;
  }

  return (
    <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
      {uploadStatus && <p className="text-center text-sm">{uploadStatus}</p>}
      {analysisError && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          Analysis Error: {analysisError.message}
        </p>
      )}
      {generationError && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          Generation Error: {generationError.message}
        </p>
      )}
    </div>
  );
}
