import { Skeleton } from "@/components/ui/skeleton";

export default function AudioRoomCardSkeleton() {
  return (
    <div className="bg-card border border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {/* Status and title area */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-3/4" />
          </div>

          {/* Description */}
          <Skeleton className="h-4 w-full" />

          {/* Stats row */}
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Host and tags */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>

        {/* Join button */}
        <Skeleton className="h-10 w-20 ml-4" />
      </div>
    </div>
  );
}
