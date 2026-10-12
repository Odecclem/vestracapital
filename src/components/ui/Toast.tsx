"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

export interface ToastState {
  isOpen: boolean;
  message: string;
  type: ToastType;
}

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
};

const styleMap = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

const iconColorMap = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
};

export default function Toast({ message, type = "success", duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to finish
  }, [onClose]);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const Icon = iconMap[type];

  return (
    <div
      className={`fixed top-6 right-6 z-[100] max-w-sm w-full transition-all duration-300 ease-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${styleMap[type]}`}>
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColorMap[type]}`} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={handleClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
