"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export const PageHeader = ({
  title,
  onAction,
  description,
  actionLabel,
  children,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
