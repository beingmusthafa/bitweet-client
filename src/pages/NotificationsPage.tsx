import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNotifications, clearNotifications } from "@/store/slices/notificationSlice";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { 
    allNotifications, 
    isLoading, 
    error, 
    hasMore, 
    currentPage 
  } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (allNotifications.length === 0) {
      dispatch(fetchNotifications(1));
    }
  }, [dispatch, allNotifications.length]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchNotifications(currentPage + 1));
    }
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-destructive">Error loading notifications: {error}</div>
            <Button 
              onClick={() => dispatch(fetchNotifications(1))} 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button 
          variant="outline" 
          onClick={handleClearNotifications}
          disabled={allNotifications.length === 0}
        >
          Clear All
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
            <Card key={notification.id} className={`${!notification.isRead ? 'border-blue-500' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{notification.title}</span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground mb-2">{notification.message}</p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span className="capitalize">{notification.type}</span>
                  <span>{formatDate(notification.createdAt)}</span>
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