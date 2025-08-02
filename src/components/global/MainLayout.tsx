import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Toaster } from "sonner";

import SideNavigation from "./SideNavigation";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationWebSocket } from "@/lib/notification-socket";

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadNotifications } = useAppSelector(
    (state) => state.notifications,
  );
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setLogoutDialogOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  useEffect(() => {
    if (user?.id) {
      notificationWebSocket.connect();
    }

    return () => {
      notificationWebSocket.disconnect();
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen md:min-w-[70vw] bg-background w-full">
      <header className=" border-b border-border sticky top-0 z-10">
        <div className="px-4">
          <div className="flex justify-between items-center h-16 bg-background">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Bitweet </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-card-foreground hidden sm:block">
                Welcome, {user?.fullName}
              </span>
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
                    <h3 className="font-semibold text-foreground">
                      Notifications
                    </h3>
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
                                  {new Date(
                                    notification.created_at,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {unreadNotifications.length > 5 && (
                          <div className="px-4 py-3 text-center text-sm text-muted-foreground border-b border-muted/30">
                            {unreadNotifications.length - 5} more unread
                            notifications
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

                  <div className=" border-t bg-muted/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-sm font-medium"
                      onClick={() => navigate("/notifications")}
                    >
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={handleLogoutClick}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 w-full">
        <div className="flex gap-6">
          <aside className="w-48 flex-shrink-0">
            <SideNavigation />
          </aside>
          <main className="flex-1 w-full">
            <Outlet />
          </main>
        </div>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will be redirected to the
              login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
