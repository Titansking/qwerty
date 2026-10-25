/**
 * Reusable Card component.
 *
 * A consistent container for grouping related content with
 * a title, optional subtitle, and padded body. Used across
 * dashboard and accuracy pages.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm p-6", className)}>
      {title && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-700 tracking-tight uppercase letter-spacing-[0.05em]">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}