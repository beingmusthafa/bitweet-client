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
    <nav className="border-r border-sidebar-border p-2 sticky top-24 h-full">
      <ul>
        {navigationItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex border-t first:border-t-0 border-border items-center gap-3 px-3 py-4 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-secondary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
