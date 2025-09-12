import Image from "next/image";

interface FilePreviewProps {
  file: File;
  preview: string | null;
  fileType: "image" | "pdf" | null;
  onClear: () => void;
  onUpload: () => void;
  isUploading: boolean;
}

export default function FilePreview({
  file,
  preview,
  fileType,
  onClear,
  onUpload,
  isUploading,
}: FilePreviewProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        {preview && fileType === "image" && (
          <Image
            src={preview}
            alt="Preview"
            width={800}
            height={256}
            className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-700 rounded-lg"
            unoptimized
          />
        )}
        {fileType === "pdf" && preview && (
          <div className="w-full h-96 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
            <iframe
              src={preview}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          </div>
        )}
        {fileType === "pdf" && !preview && (
          <div className="w-full h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">PDF Document</p>
            </div>
          </div>
        )}
        <button
          onClick={onClear}
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
          Selected: {file.name}
        </p>

        <button
          onClick={onUpload}
          disabled={isUploading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            `Analyze ${fileType?.toUpperCase()}`
          )}
        </button>
      </div>
    </div>
  );
}
