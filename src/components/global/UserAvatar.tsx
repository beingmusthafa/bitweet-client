import { User } from "lucide-react";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function UserAvatar({
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-muted rounded-full flex items-center justify-center ${className}`}
    >
      <User
        className={`${
          size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-8 w-8"
        } text-muted-foreground`}
      />
    </div>
  );
}
