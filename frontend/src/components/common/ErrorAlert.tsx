/**
 * ErrorAlert component.
 *
 * Displays API or runtime errors in a consistent, dismissible
 * banner so users always know what went wrong.
 */
export function ErrorAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="block text-rose-600">⚠</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-rose-800">Error</h3>
          <div className="mt-0.5 text-sm text-rose-700">{message}</div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex items-center rounded-md text-rose-400 hover:text-rose-500 focus:outline-none"
              aria-label="Dismiss error"
            >
              <span className="sr-only">Dismiss</span>
              <span>×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}