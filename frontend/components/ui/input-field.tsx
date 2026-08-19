import type { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function InputField({
  className = "",
  label,
  ...props
}: InputFieldProps) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input
        className={`mt-1 h-10 w-full rounded-md border border-control px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-focus disabled:opacity-60 ${className}`}
        {...props}
      />
    </label>
  );
}
