import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { unreadNotifications } = useAppSelector(
    (state) => state.notifications
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent">
              {unreadNotifications.length > 9
                ? "9+"
                : unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 min-h-[300px] bg-background/95 backdrop-blur-sm border shadow-lg"
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>

        <div className="min-h-64 overflow-y-auto">
          {unreadNotifications.length > 0 ? (
            <div className="py-2">
              {unreadNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-3 hover:bg-muted/50 border-b border-muted/30 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                        {notification.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {unreadNotifications.length > 5 && (
                <div className="px-4 py-3 text-center text-sm text-muted-foreground border-b border-muted/30">
                  {unreadNotifications.length - 5} more unread notifications
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <div className="text-sm font-medium text-muted-foreground mb-1">
                No new notifications
              </div>
              <div className="text-xs text-muted-foreground/70 text-center">
                When you get notifications, they'll show up here
              </div>
            </div>
          )}
        </div>

        <DropdownMenuItem className=" border-t bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm font-medium"
            onClick={() => navigate("/notifications")}
          >
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
