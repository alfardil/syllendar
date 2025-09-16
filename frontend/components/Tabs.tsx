"use client";

import { useEffect, useState } from "react";

type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  items: TabItem[];
  storageKey?: string;
  initialId?: string;
};

export default function Tabs({
  items,
  storageKey = "syllendar-active-tab",
  initialId,
}: TabsProps) {
  const defaultId = initialId ?? items[0]?.id ?? "";
  const [activeId, setActiveId] = useState<string>(defaultId);

  useEffect(() => {
    const saved = storageKey ? window.localStorage.getItem(storageKey) : null;
    if (saved && items.some((it) => it.id === saved)) {
      setActiveId(saved);
    }
  }, [storageKey, items]);

  useEffect(() => {
    if (storageKey) {
      window.localStorage.setItem(storageKey, activeId);
    }
  }, [activeId, storageKey]);

  const activeContent = items.find((it) => it.id === activeId)?.content ?? null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setActiveId(it.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeId === it.id
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>

      {activeContent}
    </div>
  );
}
