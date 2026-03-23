import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

interface NavButtonProps {
  label: string;
  href: string;
  isActive: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({
  label,
  href,
  isActive,
}) => {
  return (
    <Button
      variant={"outline"}
      className={cn(
        "w-full lg:w-auto justify-between font-normal hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition",
        isActive ? "bg-white/10 text-white" : "bg-transparent",
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};
