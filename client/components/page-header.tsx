"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const PageHeader = ({
  title,
  onAction,
  description,
  actionLabel,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
