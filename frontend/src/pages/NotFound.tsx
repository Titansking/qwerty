/**
 * NotFound page.
 */
export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500 mt-2">Page not found</p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        Return to Dashboard
      </a>
    </div>
  );
}