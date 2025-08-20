import { Heart, Lock, MessageCircle, Repeat2, Share } from "lucide-react";
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
    <div
      key={tweet.id}
      className="p-4 hover:bg-card/70 transition-colors border-t-card border-t-2 first:border-t-0"
    >
      <div className="flex gap-3">
        <UserAvatar />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">
              {tweet.user?.fullName || "Unknown User"}
            </span>
            <span className="text-gray-400">
              @{tweet.user?.username || "unknown"}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatDate(tweet.createdAt)}</span>
            {tweet.isPrivate && (
              <>
                <span className="text-gray-500">·</span>
                <Lock className="h-4 w-4 text-gray-400" />
              </>
            )}
          </div>
          <p className="text-gray-100 mb-3 leading-relaxed">{tweet.text}</p>
          {/* TODO: Add code field to tweet data model */}
          {/*{false && (
            <div className="mb-3 bg-gray-800 border border-gray-600 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 border-b border-gray-600">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Code</span>
              </div>
              <pre className="p-3 text-sm text-gray-100 overflow-x-auto">
                <code>{""}</code>
              </pre>
            </div>
          )}*/}
          {/* TODO: Add tags field to tweet data model */}
          {/*{false && (
            <div className="flex gap-2 mb-3">
              {[].map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-600/20 text-purple-300 px-2 py-1 text-xs border border-purple-600/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}*/}
          <div className="flex items-center gap-6 text-gray-400">
            {/* TODO: Add replies, retweets, likes counts to tweet data model */}
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <div className="p-2 group-hover:bg-blue-400/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">0</span>
            </button>
            <button className="flex items-center gap-2 hover:text-green-400 transition-colors group">
              <div className="p-2 group-hover:bg-green-400/10 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="text-sm">0</span>
            </button>
            <button className="flex items-center gap-2 hover:text-red-400 transition-colors group">
              <div className="p-2 group-hover:bg-red-400/10 transition-colors">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-sm">0</span>
            </button>
            <button className="flex items-center gap-2 hover:text-purple-400 transition-colors group">
              <div className="p-2 group-hover:bg-purple-400/10 transition-colors">
                <Share className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
