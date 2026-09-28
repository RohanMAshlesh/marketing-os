import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-slate-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.05),0_8px_20px_-8px_rgba(15,23,42,0.45)] hover:bg-slate-800 active:scale-[0.98]",
  secondary:
    "border border-black/[0.08] bg-white text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 active:scale-[0.98] disabled:hover:bg-white",
  ghost: "text-slate-600 hover:bg-slate-100 active:scale-[0.98] disabled:hover:bg-transparent",
  danger:
    "border border-rose-200 bg-white text-rose-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-rose-50 active:scale-[0.98] disabled:hover:bg-white",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
});
