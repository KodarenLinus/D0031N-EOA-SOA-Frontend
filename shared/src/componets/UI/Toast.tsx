import { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export interface ToastProps {
  open: boolean;
  title?: string;
  description?: string;
  duration?: number; // ms
  type?: "success" | "error" | "info" | "warning";
  onOpenChange?: (open: boolean) => void;
}

export function Toast({
  open,
  title,
  description,
  type = "info",
  duration = 3000,
  onOpenChange,
}: ToastProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => onOpenChange?.(false), duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onOpenChange]);

  if (!open) return null;

  const isError = type === "error";

  const typeStyles: Record<
    NonNullable<ToastProps["type"]>,
    { container: string; iconWrapper: string }
  > = {
    success: {
      container: "border-emerald-500/70 bg-emerald-600/90 text-white",
      iconWrapper: "bg-emerald-500/20",
    },
    error: {
      container: "border-red-500/70 bg-red-600/90 text-white",
      iconWrapper: "bg-red-500/20",
    },
    warning: {
      container: "border-amber-500/70 bg-amber-600/90 text-slate-950",
      iconWrapper: "bg-amber-500/20",
    },
    info: {
      container: "border-sky-500/70 bg-sky-700/90 text-white",
      iconWrapper: "bg-sky-500/20",
    },
  };

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
      ? AlertCircle
      : type === "warning"
      ? AlertTriangle
      : Info;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3
        shadow-xl backdrop-blur-sm
        text-sm font-sans
        transition-transform duration-200 ease-out
        animate-[toast-in_0.2s_ease-out]
        ${typeStyles[type].container}
      `}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      {/* Icon */}
      <div
        className={`
          mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full
          ${typeStyles[type].iconWrapper}
        `}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold leading-snug">{title}</p>}
        {description && (
          <p className="text-xs leading-snug opacity-90">{description}</p>
        )}
      </div>

      {/* Close button */}
      {onOpenChange && (
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="ml-2 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full
                     border border-white/10 bg-black/10
                     text-xs opacity-70 transition hover:opacity-100 focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Stäng notis"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
