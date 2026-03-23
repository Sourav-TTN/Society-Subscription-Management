import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "bg-foreground/80 fixed inset-0 z-50 flex items-center justify-center",
        className,
      )}
    >
      <div className="h-14 w-14 rounded-full border-2 border-t-0 border-primary animate-spin" />
    </div>
  );
};
