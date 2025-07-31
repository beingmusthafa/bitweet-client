import { Lock } from "lucide-react";
import type { Tweet } from "@/types/tweet";
import UserAvatar from "../global/UserAvatar";

interface FeedTweetItemProps {
  tweet: Tweet;
}

export default function FeedTweetItem({ tweet }: FeedTweetItemProps) {
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
    <div className="border border-b-3 border-b-black border-border hover:bg-muted/50 transition-colors">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <UserAvatar />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <div className="flex flex-col items-start">
                <span className="font-bold text-card-foreground hover:underline cursor-pointer">
                  {tweet.user?.fullName || "Unknown User"}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    @{tweet.user?.username || "unknown"}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(tweet.createdAt)}
                  </span>
                  {tweet.isPrivate && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-card-foreground text-left text-[15px] leading-5 mb-3">
              {tweet.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}