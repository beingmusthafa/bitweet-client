import { Outlet } from "react-router-dom";

import { Toaster } from "sonner";

import SideNavigation from "./SideNavigation";
import Header from "./Header";
// import FloatingAudioRoom from "../audioroom/FloatingAudioRoom";
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      <div className="w-full">
        <div className="flex gap-6">
          <aside className="w-48  flex-shrink-0">
            <SideNavigation />
          </aside>
          <main className="flex-1 w-full py-6">
            <Outlet />
          </main>
        </div>
      </div>

      <Toaster />
      {/*<FloatingAudioRoom />*/}
    </div>
  );
}
