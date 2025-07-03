import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import UserAvatar from "@/components/global/UserAvatar";

interface PeopleResponse {
  users: User[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  const fetchUsers = async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get<PeopleResponse>(endpoints.getPeople, {
        params: { page_number: pageNum, page_size: 20 },
      });

      const { users: newUsers, total_pages } = response.data;

      if (append) {
        setUsers((prev) => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }

      setHasMore(pageNum < total_pages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      setFollowingUsers((prev) => new Set(prev).add(userId));
      await api.post(endpoints.follow, { to_follow: userId });
    } catch (error) {
      console.error("Failed to follow user:", error);
      setFollowingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, true);
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Follow Users</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Follow Users</h1>
      </div>

      <div className="space-y-2 flex flex-col items-center w-full">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 w-[30rem]"
          >
            <UserAvatar size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleFollow(user.id)}
              disabled={followingUsers.has(user.id)}
              className="text-xs px-3 py-1 h-7"
            >
              <UserPlus className="h-3 w-3" />
              {followingUsers.has(user.id) ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
