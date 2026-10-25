/**
 * Loading spinner component.
 *
 * Shown while data is being fetched from the backend API.
 */
export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}