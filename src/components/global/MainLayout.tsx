import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";

import SideNavigation from "./SideNavigation";
import NotificationDropdown from "./NotificationDropdown";
// import FloatingAudioRoom from "../audioroom/FloatingAudioRoom";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationWebSocket } from "@/lib/notification-socket";

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
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
              <NotificationDropdown />

              <Button variant="outline" size="sm" onClick={handleLogoutClick}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full">
        <div className="flex gap-6 h-[calc(100dvh-100px)]">
          <aside className="w-48  flex-shrink-0">
            <SideNavigation />
          </aside>
          <main className="flex-1 w-full py-6">
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
      {/*<FloatingAudioRoom />*/}
    </div>
  );
}
