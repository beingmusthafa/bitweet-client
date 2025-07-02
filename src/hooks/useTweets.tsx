import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { Tweet, TweetsResponse } from "@/types/tweet";
import { useState, useEffect } from "react";

export function useTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  });

  const fetchTweets = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<TweetsResponse>(
        `${endpoints.getMyTweets}?page_number=${page}`
      );
      const data = response.data;

      if (page === 1) {
        setTweets(data.tweets);
      } else {
        setTweets((prev) => [...prev, ...data.tweets]);
      }

      setPagination({
        page: data.page,
        page_size: data.page_size,
        total: data.total,
        total_pages: data.total_pages,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch tweets");
    } finally {
      setLoading(false);
    }
  };

  const deleteTweet = async (id: string) => {
    try {
      await api.delete(endpoints.deleteTweet(id));
      setTweets((prev) => prev.filter((tweet) => tweet.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete tweet");
    }
  };

  const updateTweet = async (
    id: string,
    data: { text: string; isPrivate: boolean }
  ) => {
    try {
      const response = await api.put<Tweet>(endpoints.updateTweet(id), data);
      setTweets((prev) =>
        prev.map((tweet) => (tweet.id === id ? response.data : tweet))
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update tweet");
      throw err;
    }
  };

  const loadMore = () => {
    if (pagination.page < pagination.total_pages) {
      fetchTweets(pagination.page + 1);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  return {
    tweets,
    loading,
    error,
    pagination,
    loadMore,
    deleteTweet,
    updateTweet,
    refetch: () => fetchTweets(1),
  };
}
