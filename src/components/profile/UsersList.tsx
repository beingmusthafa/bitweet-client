import type { User } from "@/types/user";
import UserAvatar from "../global/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { useState } from "react";

interface UsersListProps {
  users: User[];
  loading: boolean;
  error: string | null;
  emptyText?: string;
  showUnfollowButton?: boolean;
  onUnfollow?: (userId: string) => void;
  listType?: "followers" | "following";
}

export default function UsersList({
  users,
  loading,
  error,
  emptyText,
  showUnfollowButton = false,
  onUnfollow,
  listType,
}: UsersListProps) {
  const [unfollowingUsers, setUnfollowingUsers] = useState<Set<string>>(
    new Set(),
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  const handleUnfollowClick = (user: User) => {
    setConfirmDialog({ open: true, user });
  };

  const handleConfirmUnfollow = async () => {
    if (!confirmDialog.user) return;

    try {
      setUnfollowingUsers((prev) => new Set(prev).add(confirmDialog.user!.id));
      await api.post(endpoints.unfollow, {
        to_unfollow: confirmDialog.user.id,
      });
      onUnfollow?.(confirmDialog.user.id);
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    } finally {
      setUnfollowingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(confirmDialog.user!.id);
        return newSet;
      });
      setConfirmDialog({ open: false, user: null });
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    const defaultMessage =
      listType === "followers"
        ? "No followers yet"
        : listType === "following"
          ? "Not following anyone yet"
          : "No users found";

    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-center">
          {emptyText || defaultMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 bg-card justify-between px-8 w-full"
          >
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
            {showUnfollowButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnfollowClick(user)}
                disabled={unfollowingUsers.has(user.id)}
                className="text-xs px-3 py-1 h-7"
              >
                {unfollowingUsers.has(user.id) ? "Unfollowing..." : "Unfollow"}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfollow {confirmDialog.user?.fullName}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to unfollow @{confirmDialog.user?.username}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmUnfollow}>
              Unfollow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
