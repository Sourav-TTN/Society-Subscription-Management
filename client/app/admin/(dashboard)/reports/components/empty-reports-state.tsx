import { FileText } from "lucide-react";

export const EmptyReportsState = () => {
  return (
    <div className="text-center py-12 border border-border rounded-lg bg-muted/20">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">No reports loaded</p>
      <p className="text-sm text-muted-foreground mt-1">
        Click on "Load Reports" to view the data
      </p>
    </div>
  );
};
