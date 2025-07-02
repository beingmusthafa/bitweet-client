import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

import SideNavigation from "./SideNavigation";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen min-w-[70vw] bg-gray-50 w-full">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Twitter Clone</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden sm:block">
                Welcome, {user?.fullName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
    </div>
  );
}
