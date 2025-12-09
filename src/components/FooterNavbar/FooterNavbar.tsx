import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Users, Compass, User, Building, Info, CircleDollarSign } from "lucide-react";
import { useAppContext } from "@Context/App.context";

const FooterNavbar = () => {
  const { userDetails } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine which nav should be active for jobs/refer-a-friend
  const isReferAFriendActive = location.pathname === "/jobs" && location.search.includes("dashboard=USER");
  const isJobsActive = location.pathname === "/jobs" && !location.search.includes("dashboard=USER");
  const isGuidanceActive = location.pathname === "/guidance";
  // Check if current path starts with /v1/candidate or /v1/employee
  const isDashboardActive = location.pathname.startsWith(`/${import.meta.env.APP_PROXY_DASH}/candidate/`) || 
                           location.pathname.startsWith(`/${import.meta.env.APP_PROXY_DASH}/employee/`);

  const externalLinks = [
    {
      label: "Refer-a-friend",
      to: "/jobs?dashboard=USER",
      icon: <CircleDollarSign className="w-5 h-5" />,
      isActive: isReferAFriendActive,
    },
    { label: "Guidance", to: "/guidance", icon: <Compass className="w-5 h-5" />, isActive: isGuidanceActive },
    {
      label: "Jobs",
      to: "/jobs",
      icon: <Briefcase className="w-5 h-5" />,
      isActive: isJobsActive,
    },
  ];

  const internalLink = userDetails
    ? { 
        label: "Profile", 
        to: `/candidate/profile`, // Relative path within the micro-frontend
        icon: <User className="w-5 h-5" />,
        isActive: isDashboardActive
      }
    : { label: "Login/Signup", to: "/login", icon: <User className="w-5 h-5" />, isExternal: true };

  const handleExternalNavigation = (path: string) => {
    // Use window.location.assign for navigation outside micro-frontend
    window.location.assign(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md z-50">
      <ul className="flex w-full justify-between items-center py-1">
        {externalLinks.map((link) => (
          <li key={link.label} className="flex-1 flex justify-center">
            <button
              onClick={() => handleExternalNavigation(link.to)}
              className={`ml-4 flex flex-col items-center text-[10px] font-semibold px-2 py-1 transition-colors duration-200 ${
                link.isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`}>
              {link.icon}
              <span className="mt-1 text-nowrap">{link.label}</span>
            </button>
          </li>
        ))}
        <li className="flex-1 flex-shrink-1  flex justify-center">
          {internalLink.isExternal ? (
            <button
              onClick={() => handleExternalNavigation(internalLink.to)}
              className="flex flex-col items-center text-[10px] font-semibold px-2 py-1 transition-colors duration-200 text-gray-500 hover:text-blue-500">
              {internalLink.icon}
              <span className="mt-1">{internalLink.label}</span>
            </button>
          ) : (
            <NavLink
              to={internalLink.to}
              className={`flex flex-col items-center text-[10px] font-semibold px-2 py-1 transition-colors duration-200 ${
                internalLink.isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`}>
              {internalLink.icon}
              <span className="mt-1">{internalLink.label}</span>
            </NavLink>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default FooterNavbar;
