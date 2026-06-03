import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

export default function IconButton({
  children,
  label,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-subtle transition-colors hover:bg-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
