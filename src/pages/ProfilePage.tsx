import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader } from "@/components/ui/card";
import { useAppSelector } from "../store/hooks";
import { useState, useEffect } from "react";

import UserAvatar from "@/components/global/UserAvatar";
import TweetsList from "@/components/tweet/TweetsList";
import UsersList from "@/components/connections/UsersList";
import { useFollowers, useFollowing } from "@/hooks/useConnections";
import type { User } from "@/types/user";

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const followers = useFollowers();
  const following = useFollowing();
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);

  useEffect(() => {
    setFollowingUsers(following.users);
  }, [following.users]);

  const handleUnfollow = (userId: string) => {
    setFollowingUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r">
        <CardHeader className="pb-6">
          <div className="flex justify-center w-full gap-6">
            <div className="flex-shrink-0">
              <UserAvatar size="lg" />
            </div>
            <div className="flex-1 w-fit text-left">
              <span className="text-2xl w-fit font-bold text-gray-900 mb-2">
                {user.fullName}
              </span>
              <p className="text-lg w-fit font-medium mb-1">@{user.username}</p>
              <p className="text-sm w-fit text-gray-600 bg-white/60 py-1 rounded-full inline-block">
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
          <TweetsList />
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
