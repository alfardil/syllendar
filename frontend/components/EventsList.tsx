import { formatDateTime } from "@/app/utils/dateUtils";

interface Event {
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
  event_type?: string;
  recurrence?: string;
  days?: string[];
}

interface ExtractedEvents {
  course_name: string;
  course_code: string;
  events: Event[];
}

interface EventsListProps {
  extractedEvents: ExtractedEvents;
  selectedEvents: Set<number>;
  onEventToggle: (index: number) => void;
  onSelectAll: () => void;
  onGenerateICS: () => void;
  isGeneratingICS: boolean;
}

export default function EventsList({
  extractedEvents,
  selectedEvents,
  onEventToggle,
  onSelectAll,
  onGenerateICS,
  isGeneratingICS,
}: EventsListProps) {
  return (
    <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Extracted Events
        </h3>
        <button
          onClick={onSelectAll}
          className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          {selectedEvents.size === extractedEvents.events?.length
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-800 dark:text-gray-200">
          {extractedEvents.course_name} ({extractedEvents.course_code})
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {extractedEvents.events && extractedEvents.events.length > 0
            ? `${selectedEvents.size} of ${extractedEvents.events.length} events selected`
            : "No events found"}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {extractedEvents.events && extractedEvents.events.length > 0 ? (
          extractedEvents.events.map((event: Event, index: number) => (
            <div
              key={index}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                selectedEvents.has(index)
                  ? "bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600"
                  : "bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500"
              }`}
              onClick={() => onEventToggle(index)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedEvents.has(index)}
                  onChange={() => onEventToggle(index)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
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
                  {event.event_type && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                      {event.event_type}
                    </span>
                  )}
                  {event.recurrence && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      🔄 {event.recurrence} on {event.days?.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Events Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Sorry, there were no events available in this syllabus.
            </p>
          </div>
        )}
      </div>

      {extractedEvents.events && extractedEvents.events.length > 0 && (
        <div className="text-center">
          <button
            onClick={onGenerateICS}
            disabled={isGeneratingICS}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            {isGeneratingICS ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating ICS...</span>
              </div>
            ) : (
              `Generate ICS File ${
                selectedEvents.size > 0
                  ? `(${selectedEvents.size} selected)`
                  : "(all events)"
              }`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
