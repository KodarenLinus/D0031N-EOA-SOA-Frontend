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
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl text-white 
        ${
          type === "success" ? "bg-green-600" :
          type === "error" ? "bg-red-600" :
          type === "warning" ? "bg-yellow-500" :
          "bg-blue-600"
        }`}
    >
      {title && <p className="font-semibold">{title}</p>}
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
