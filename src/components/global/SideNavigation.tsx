import { NavLink } from "react-router-dom";
import { User, Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "My Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "People",
    href: "/people",
    icon: Users,
  },
  {
    name: "Feed",
    href: "/feed",
    icon: Home,
  },
];

export default function SideNavigation() {
  return (
    <nav className="bg-white rounded-lg border border-gray-200 p-2">
      <ul className="space-y-1">
        {navigationItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
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
