"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
interface ChatIcsDownloadProps {
  pendingIcsData: any;
  isGenerating: boolean;
  onDownload: () => Promise<void> | void;
}

export default function ChatIcsDownload({
  pendingIcsData,
  isGenerating,
  onDownload,
}: ChatIcsDownloadProps) {
  if (!pendingIcsData) return null;

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
      <Card className="py-3 gap-2">
        <CardContent className="px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-700 dark:text-green-300">
                ICS ready to download
              </span>
            </div>
            <Button
              onClick={onDownload}
              disabled={isGenerating}
              size="sm"
              variant="neutral"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  <span className="ml-2">Downloading</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="ml-2">Download</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
