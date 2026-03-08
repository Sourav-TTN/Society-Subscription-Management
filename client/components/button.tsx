import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps {
  variant?: "default" | "destructive" | "outline";
}

const variants: Record<string, string> = {
  default: "bg-primary hover:bg-primary/90 text-primary-foreground",
  destructive:
    "bg-destructive/80 hover:bg-destructive/70 focus-visible:ring-destructive/20 text-background focus-visible:border-destructive/50",
  outline:
    "border-2 border-border bg-background hover:text-foreground hover:bg-muted",
};

export const Button = ({
  children,
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & ButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
};
