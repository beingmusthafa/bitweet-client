import { Skeleton } from "@/components/ui/skeleton";

export default function FeedTweetItemSkeleton() {
  return (
    <div className="p-4 border-t-card border-t-2 first:border-t-0">
      <div className="flex gap-3">
        {/* Avatar */}
        <Skeleton className="w-10 h-10" />

        <div className="flex-1 space-y-3">
          {/* User info and timestamp */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>

          {/* Tweet content */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full md:w-1/2" />
            <Skeleton className="h-4 w-3/4 md:w-1/3" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6 pt-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
