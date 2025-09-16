"use client";

import Header from "../components/Header";
import ChatBot from "../components/ChatBot";
import Tabs from "../components/Tabs";
import UploadFlow from "../components/UploadFlow";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Header />

          <Tabs
            storageKey="syllendar-active-tab"
            items={[
              {
                id: "upload",
                label: "Upload Syllabus",
                content: <UploadFlow />,
              },
              { id: "chat", label: "Chat Assistant", content: <ChatBot /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
