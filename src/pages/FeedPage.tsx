import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { Tweet } from "@/types/tweet";
import { Button } from "@/components/ui/button";
import FeedTweetItem from "@/components/tweet/FeedTweetItem";
import CreateTweetDialog from "@/components/tweet/CreateTweetDialog";
import FeedTweetItemSkeleton from "@/components/tweet/TweetSkeleton";

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

  const handleTweetCreated = () => {
    setPage(1);
    fetchTweets(1);
  };

  return (
    <div className="space-y-4">
      {loading ? (
        new Array(5).fill(0).map((_, i) => <FeedTweetItemSkeleton key={i} />)
      ) : tweets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-center mt-[20vh]">
            No tweets in your feed yet!
          </p>
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
