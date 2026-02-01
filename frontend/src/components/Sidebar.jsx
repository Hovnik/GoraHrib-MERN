import { Link, useLocation } from "react-router";
import { Map, ListChecks, User, MessageCircle, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide on mobile (screen width < 768px)
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          // Scrolling down & past 50px
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const links = [
    { path: "/map", icon: Map },
    { path: "/checklist", icon: ListChecks },
    { path: "/profile", icon: User },
    { path: "/forum", icon: MessageCircle },
    { path: "/leaderboard", icon: Trophy },
  ];

  return (
    <aside
      className={`bg-base-200/90 backdrop-blur-md fixed bottom-4 left-4 right-4 h-16 rounded-full z-50 md:bg-base-200 md:backdrop-blur-none md:w-20 md:h-auto md:left-0 md:top-16 md:bottom-0 md:right-auto md:rounded-none md:z-40 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-24 md:translate-y-0"
      }`}
    >
      <ul className="menu flex flex-row justify-around items-center p-2 md:p-2 md:flex-col md:justify-start md:space-y-4 h-full">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.path} className="flex-1 md:flex-none">
              <Link
                to={link.path}
                className={`flex justify-center items-center p-2 h-full md:p-2 rounded-full ${
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
