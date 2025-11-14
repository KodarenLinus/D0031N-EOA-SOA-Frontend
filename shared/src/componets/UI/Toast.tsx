import { useEffect } from "react";

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

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl font-arial text-sm
        ${
          type === "success" ? "bg-green-300 border-green-700 text-white " :
          type === "error" ? "bg-red-100 border-red-700 text-white " :
          type === "warning" ? "bg-yellow-100 border-yellow-700 text-white " :
          type === "info" ? "bg-blue-100 border-blue-700 text-white " :
          "bg-blue-100S text-white"
        }`}
    >
      {title && <p className="font-semibold">{title}</p>}
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
