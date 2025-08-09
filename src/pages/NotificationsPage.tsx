import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  title: string | null;
  message: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  data: Notification[];
  page: number;
  has_more: boolean;
}

export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<NotificationsResponse>(
        `/notifications?page=${page}`,
      );

      if (page === 1) {
        setAllNotifications(response.data.data);
      } else {
        setAllNotifications((prev) => [...prev, ...response.data.data]);
      }

      setHasMore(response.data.has_more);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (allNotifications.length === 0) {
      fetchNotifications(1);
    }
  }, [allNotifications.length]);

  useEffect(() => {
    const hasUnreadNotifications = allNotifications.some(
      (notification) => !notification.is_read,
    );
    if (hasUnreadNotifications) {
      api.patch("/notifications/mark-all-read").catch(() => {});
    }
  }, [allNotifications]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(currentPage + 1);
    }
  };

  const handleClearNotifications = async () => {
    try {
      setIsClearing(true);
      await api.delete("/notifications/clear-all");
      setAllNotifications([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to clear notifications");
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className=" mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-destructive">
              Error loading notifications: {error}
            </div>
            <Button onClick={() => fetchNotifications(1)} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <Button
          variant="outline"
          onClick={handleClearNotifications}
          disabled={allNotifications.length === 0 || isClearing}
        >
          {isClearing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Clearing
            </>
          ) : (
            "Clear All"
          )}
        </Button>
      </div>

      {allNotifications.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No notifications yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`py-3 ${!notification.is_read ? "border-l-4 border-border/50" : "bg-muted/80"}`}
            >
              <CardContent className="p-3 py-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-left">
                    <p className="text-sm text-card-foreground leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground/70 mt-1.5 block text-end">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-border rounded-full mt-0.5 flex-shrink-0"></span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
