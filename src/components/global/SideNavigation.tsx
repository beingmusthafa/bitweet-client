import { NavLink } from "react-router-dom";
import { User, Users, Home, Bell } from "lucide-react";
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
    <nav className="bg-sidebar rounded-lg border border-sidebar-border p-2 sticky top-24">
      <ul className="space-y-1">
        {navigationItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
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
