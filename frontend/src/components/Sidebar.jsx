import { Link, useLocation } from "react-router";
import { Map, ListChecks, User, MessageCircle, Trophy } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { path: "/map", icon: Map },
    { path: "/checklist", icon: ListChecks },
    { path: "/profile", icon: User },
    { path: "/forum", icon: MessageCircle },
    { path: "/leaderboard", icon: Trophy },
  ];

  return (
    <aside className="bg-base-200 fixed bottom-0 left-0 right-0 h-16 z-50 md:w-20 md:h-auto md:left-0 md:top-16 md:bottom-0 md:right-auto md:z-40">
      <ul className="menu flex flex-row justify-around items-center p-2 md:p-2 md:flex-col md:justify-start md:space-y-4 h-full">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.path} className="flex-1 md:flex-none">
              <Link
                to={link.path}
                className={`flex justify-center items-center p-2 h-full md:p-2 ${
                  location.pathname === link.path ? "active" : ""
                }`}
              >
                <Icon className="w-7 h-7 md:w-8 md:h-8" />
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
