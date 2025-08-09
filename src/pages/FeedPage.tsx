import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { Tweet } from "@/types/tweet";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import FeedTweetItem from "@/components/tweet/FeedTweetItem";
import CreateTweetDialog from "@/components/tweet/CreateTweetDialog";

interface FeedResponse {
  tweets: Tweet[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export default function FeedPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTweets = async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get<FeedResponse>(endpoints.getFeed, {
        params: { page_number: pageNum },
      });

      const { tweets: newTweets, total_pages } = response.data;

      if (append) {
        setTweets((prev) => [...prev, ...newTweets]);
      } else {
        setTweets(newTweets);
      }

      setHasMore(pageNum < total_pages);
    } catch (error) {
      console.error("Failed to fetch tweets:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTweets(nextPage, true);
  };

  useEffect(() => {
    fetchTweets(1);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Home className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Feed</h1>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const handleTweetCreated = () => {
    setPage(1);
    fetchTweets(1);
  };

  return (
    <div className="space-y-4  mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Home className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Feed</h1>
      </div>

      {tweets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tweets in your feed yet!</p>
        </div>
      ) : (
        <>
          <div>
            {tweets.map((tweet) => (
              <FeedTweetItem key={tweet.id} tweet={tweet} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}

      <CreateTweetDialog onTweetCreated={handleTweetCreated} />
    </div>
  );
}
