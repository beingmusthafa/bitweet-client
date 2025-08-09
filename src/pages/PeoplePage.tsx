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

  return (
    <div className="space-y-4  mx-auto md:w-1/2">
      <div className="space-y-2 flex flex-col items-center w-full">
        {users.length === 0 ? (
          <p className="text-muted-foreground my-32">No users to show</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 bg-card justify-between px-8 w-full"
            >
              <div className="flex items-center gap-4">
                <UserAvatar size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground truncate text-sm">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-start text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>
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
          ))
        )}
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
