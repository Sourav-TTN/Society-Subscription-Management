import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "default" | "destructive" | "outline";
}

const variants: Record<string, string> = {
  default: "bg-primary hover:bg-primary/80 text-primary-foreground",
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
        "px-4 h-8 rounded-md border border-transparent bg-clip-padding text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 inline-flex items-center justify-center whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 shrink-0",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
};
