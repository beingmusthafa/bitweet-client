import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { UserCard, UserCardSkeleton } from "@/components/connections/UserCard";

interface PeopleResponse {
  users: User[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  const fetchUsers = async (pageNum: number, append = false) => {
    try {
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
      setLoadingMore(false);
      if (!append) setInitialLoading(false);
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
    <div className="space-y-4  px-3 md:px-0 mx-auto md:w-1/2">
      <div className="space-y-2 flex flex-col items-center w-full">
        {initialLoading ? (
          new Array(7)
            .fill(0)
            .map((_, index) => <UserCardSkeleton key={index} />)
        ) : users.length === 0 ? (
          <p className="text-muted-foreground my-32">No users to show</p>
        ) : (
          users.map((user) => (
            <UserCard
              isFollowing={followingUsers.has(user.id)}
              onFollow={handleFollow}
              user={user}
            />
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
