import { NavLink } from "react-router-dom";
import { User, Users, Home, Bell, Radio, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    name: "Feed",
    href: "/feed",
    icon: Home,
  },
  {
    name: "People",
    href: "/people",
    icon: Users,
  },
  {
    name: "Audio Rooms",
    href: "/audioroom",
    icon: Radio,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: User,
  },
];

export default function SideNavigation({
  isSidebarOpen,
  toggleSidebar,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-4 z-40 transform transition-transform duration-300 ease-in-out",
        {
          "translate-x-0": isSidebarOpen,
          "-translate-x-full": !isSidebarOpen,
        },
        "lg:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between whitespace-nowrap gap-2 mb-8">
        <div className="flex items-center gap-2">
          <img src="/bitweet.png" className="size-6" />
          <h1 className="text-xl font-bold text-white">Bitweet</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      <nav className="space-y-2 divide-y divide-accent/50">
        {navigationItems.map(({ icon: Icon, name, href }) => (
          <NavLink
            key={name}
            to={href}
            onClick={toggleSidebar} // close sidebar on link click in mobile
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-4 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )
            }
          >
            <Icon className="w-5 h-5" />
            {name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
