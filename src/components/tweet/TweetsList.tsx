import { Button } from "@/components/ui/button";
import TweetItem from "./TweetItem";
import { useTweets } from "@/hooks/useTweets";

export default function TweetsList() {
  const {
    tweets,
    loading,
    error,
    pagination,
    loadMore,
    deleteTweet,
    updateTweet,
  } = useTweets();

  if (loading && tweets.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && tweets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tweets yet!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetItem
          key={tweet.id}
          tweet={tweet}
          onDelete={deleteTweet}
          onUpdate={updateTweet}
        />
      ))}

      {pagination.page < pagination.total_pages && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
