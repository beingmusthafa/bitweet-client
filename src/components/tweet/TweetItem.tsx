import { useState } from "react";
import { MoreHorizontal, Lock, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAppSelector } from "@/store/hooks";
import type { Tweet } from "@/types/tweet";
import UserAvatar from "../global/UserAvatar";

interface TweetItemProps {
  tweet: Tweet;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    data: { text: string; isPrivate: boolean },
  ) => Promise<any>;
}

export default function TweetItem({
  tweet,
  onDelete,
  onUpdate,
}: TweetItemProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.text);
  const [editIsPrivate, setEditIsPrivate] = useState(tweet.isPrivate);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    setEditText(tweet.text);
    setEditIsPrivate(tweet.isPrivate);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editText.trim()) return;

    try {
      setIsUpdating(true);
      await onUpdate(tweet.id, {
        text: editText.trim(),
        isPrivate: editIsPrivate,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditText(tweet.text);
    setEditIsPrivate(tweet.isPrivate);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="border-y border-border transition-colors">
      <div className="max-w-lg mx-auto p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-text" className="mb-2">
                Tweet Text
              </Label>
              <Input
                id="edit-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="What's happening?"
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-private"
                  checked={editIsPrivate}
                  onCheckedChange={setEditIsPrivate}
                />
                <Label htmlFor="edit-private" className="text-sm">
                  Private tweet
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating || !editText.trim()}
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 justify-between items-start">
            {/* Avatar */}

            {/* Tweet Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-shrink-0">
                  <UserAvatar />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-card-foreground hover:underline cursor-pointer">
                      {user?.fullName || "Unknown User"}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted">
                        @{user?.username || "unknown"}
                      </span>
                      <span className="text-muted">·</span>
                      <span className="text-muted text-sm">
                        {formatDate(tweet.createdAt)}
                      </span>{" "}
                      {tweet.isPrivate && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </>
                      )}
                    </div>
                  </div>
                  {/* Tweet Text */}
                </div>
              </div>
              <div className="text-card-foreground text-left text-[15px] leading-5 mb-3">
                {tweet.text}
              </div>
            </div>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tweet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tweet? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(tweet.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
