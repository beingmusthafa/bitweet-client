import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import SideNavigation from "./SideNavigation";
import Header from "./Header";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-background w-full">
      <Header toggleSidebar={toggleSidebar} />
      <div className="w-full">
        <div className="flex gap-6 lg:pl-64">
          <SideNavigation
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
          <main className="flex-1 w-full py-6">
            <Outlet />
          </main>
        </div>
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <Toaster />
    </div>
  );
}
