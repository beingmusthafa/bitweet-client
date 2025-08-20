import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "../store/hooks";
import { useState, useEffect } from "react";

import UserAvatar from "@/components/global/UserAvatar";
import TweetItem from "@/components/tweet/TweetItem";
import UsersList from "@/components/profile/UsersList";
import { useFollowers, useFollowing } from "@/hooks/useConnections";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { User } from "@/types/user";
import type { Tweet, TweetsResponse } from "@/types/tweet";

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const followers = useFollowers();
  const following = useFollowing();
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    setFollowingUsers(following.users);
  }, [following.users]);

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

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleUnfollow = (userId: string) => {
    setFollowingUsers((prev) => prev.filter((u) => u.id !== userId));
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
      console.log("Updating tweet:", id, data);
      const response = await api.put<Tweet>(endpoints.updateTweet(id), data);
      console.log("API response:", response.data);

      setTweets((prev) => {
        console.log("Previous tweets:", prev);
        const updated = prev.map((tweet) =>
          tweet.id === id
            ? { ...tweet, text: data.text, isPrivate: data.isPrivate }
            : tweet
        );
        console.log("Updated tweets:", updated);
        return updated;
      });
      return response.data;
    } catch (err: any) {
      console.error("Update tweet error:", err);
      setError(err.response?.data?.message || "Failed to update tweet");
      throw err;
    }
  };

  const loadMore = () => {
    if (pagination.page < pagination.total_pages) {
      fetchTweets(pagination.page + 1);
    }
  };

  if (!user) return null;

  return (
    <div className="w-3/4 mx-auto space-y-6">
      <Card className="bg-gradient-to-r rounded-none border-border/20">
        <CardHeader className="pb-6">
          <div className="flex justify-center w-full gap-6">
            <div className="flex-shrink-0">
              <UserAvatar size="lg" />
            </div>
            <div className="flex-1 w-fit text-left">
              <span className="text-2xl w-fit font-bold text-card-foreground mb-2">
                {user.fullName}
              </span>
              <p className="text-lg w-fit font-medium mb-1">@{user.username}</p>
              <p className="text-sm w-fit text-muted-foreground bg-card/60 py-1 rounded-full inline-block">
                {user.email}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Tabs defaultValue="tweets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tweets">My Tweets</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="tweets" className="mt-6">
          {loading && tweets.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error && tweets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : tweets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tweets yet!</p>
            </div>
          ) : (
            <div>
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
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <UsersList
            users={followers.users}
            loading={followers.loading}
            error={followers.error}
            listType="followers"
          />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <UsersList
            users={followingUsers}
            loading={following.loading}
            error={following.error}
            showUnfollowButton={true}
            onUnfollow={handleUnfollow}
            listType="following"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
