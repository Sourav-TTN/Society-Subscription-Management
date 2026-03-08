"use client";

import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      className,
      containerClassName,
      type = "text",
      icon,
      helperText,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={clsx("space-y-1", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={clsx(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
              "border-input focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-destructive focus:ring-destructive",
              className,
            )}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);
