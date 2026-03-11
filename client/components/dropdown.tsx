"use client";

import clsx from "clsx";
import * as React from "react";
import { ChevronDown, Check } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select...",
      className,
      disabled = false,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedOption = options?.find((opt) => opt.value === value);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        setIsOpen(!isOpen);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          className={clsx(
            "flex w-full items-center justify-between rounded-md border bg-popover px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {isOpen && (
          <ul
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-sm shadow-lg"
            role="listbox"
          >
            {options?.map((option) => (
              <li
                key={option.value}
                className={clsx(
                  "flex cursor-pointer select-none items-center gap-2 px-3 py-2",
                  option.value === value
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-accent-foreground",
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                {option.icon}
                {option.label}
                {option.value === value && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
