import { NavLink } from "react-router-dom";
import { User, Users, Home, Bell, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function SideNavigation() {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-4">
      <div className="flex items-center whitespace-nowrap gap-2 mb-8">
        <img src="bitweet.png" className="size-6" />
        <h1 className="text-xl font-bold text-white">Bitweet</h1>
      </div>

      <nav className="space-y-2 divide-y divide-accent/50">
        {navigationItems.map(({ icon: Icon, name, href }) => (
          <NavLink
            key={name}
            to={href}
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
