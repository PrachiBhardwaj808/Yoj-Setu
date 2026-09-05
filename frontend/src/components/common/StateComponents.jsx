/** LoadingState — consistent loading skeleton for all data-driven pages */
export function LoadingState({ message = 'Loading…', rows = 4 }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <svg className="w-8 h-8 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );
}

/** ErrorState — consistent error display */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">⚠️</div>
      <div>
        <p className="font-semibold text-gray-800 mb-1">Oops! An error occurred</p>
        <p className="text-sm text-gray-500 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/** EmptyState — no results / empty list placeholder */
export function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
      <div className="text-4xl">{icon}</div>
      <p className="font-semibold text-gray-800">{title}</p>
      {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
