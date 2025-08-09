import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NotificationDropdown from "./NotificationDropdown";
import { logout } from "@/store/slices/authSlice";
import { notificationWebSocket } from "@/lib/notification-socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Header = () => {
  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const handleLogout = () => {
    dispatch(logout());
    setLogoutDialogOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      notificationWebSocket.connect();
    }

    return () => {
      notificationWebSocket.disconnect();
    };
  }, [user?.id]);

  return (
    <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 px-4">
      {/*logout dialog*/}
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
  );
};

export default Header;
