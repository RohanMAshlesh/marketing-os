import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const FIELD_CLASSES =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${FIELD_CLASSES} ${className}`} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", ...props }, ref) {
    return <textarea ref={ref} className={`${FIELD_CLASSES} ${className}`} {...props} />;
  }
);

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`mb-1.5 block text-sm font-medium text-slate-700 ${className}`}>{children}</label>;
}
