"use client";
import { IconType } from "react-icons";

interface AuthSocialButtonProps {
  Icon: IconType;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({
  Icon,
  text,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    >
      <Icon className="h-5 w-5" />
      <span>{text}</span>
    </button>
  );
};
