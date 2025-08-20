import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "../global/UserAvatar";

interface User {
  id: string;
  fullName: string;
  username: string;
}

interface UserCardProps {
  user: User;
  isFollowing: boolean;
  onFollow: (userId: string) => void;
}

export function UserCard({ user, isFollowing, onFollow }: UserCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card justify-between px-8 w-full">
      <div className="flex items-center gap-4">
        <UserAvatar size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-card-foreground truncate text-sm">
            {user.fullName}
          </p>
          <p className="text-xs text-start text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => onFollow(user.id)}
        disabled={isFollowing}
        className="text-xs px-3 py-1 h-7"
      >
        <UserPlus className="h-3 w-3" />
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-card justify-between px-8 w-full">
      <div className="flex items-center gap-4">
        <Skeleton className="w-8 h-8" />
        <div className="flex-1 min-w-0 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-7 w-16" />
    </div>
  );
}
