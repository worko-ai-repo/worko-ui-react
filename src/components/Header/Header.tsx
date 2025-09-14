import { useEffect, useState, useRef } from "react";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { coin, logo_text } from "@Assets";
import { useCrossAppAuth } from "@Hooks/useCrossAppAuth.hook";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@Context/App.context";
import CognitoServiceObj from "@Utils/Cognito.utils";
import secureStorage from "@Utils/SecureStorage.utils";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { cn } from "@Utils/Tailwind.util";

interface NavItem {
  label: string;
  href?: string;
  subItems?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "For Candidate",
    subItems: [
      { label: "Jobs", href: "/jobs" },
      { label: "Request Referral", href: "/referrals" },
      { label: "Request Guidance", href: "/guidance" },
    ],
  },
  { label: "For Employee", href: "/for-employee" },
  { label: "For Corporate", href: "/corporate" },
  { label: "About Us", href: "/about" },
];

const Header = () => {
  const appHref = useCrossAppAuth();
  const navigateTo = useNavigate();
  const { isLoggedIn, userDetails, setUpdateCheck } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [imgError, setImgError] = useState(false);
  const userType = secureStorage.getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE);
  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to handle click outside of header to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const proxy = import.meta.env.APP_PROXY_DASH;

  // Function to get profile path based on user type
  const getProfilePath = () => {
    if (userType?.includes(UserRole.CORPORATE)) {
      return `/${proxy}/corporate/jobs/`;
    } else if (userType?.includes(UserRole.ADMIN)) {
      return `/${proxy}/admin/ajobs`;
    } else {
      if (userDetails?.lastAccessedDash === "CAND") {
        return `/${proxy}/candidate/profile`;
      } else {
        return `/${proxy}/employee/profile`;
      }
    }

    //below is the old one with evaluator path
    //     if (userType?.includes(UserRole.CORPORATE)) {
    //   return `/${proxy}/corporate/jobs/`;
    // } else if (userType?.includes(UserRole.EVALUATOR)) {
    //   //encode useremail and append to evaluator-dashboard path
    //   return `/${proxy}/evaluator-dashboard/?evaluatorEmail=${encodeURIComponent(userDetails?.email || "")}`;
    // } else if (userType?.includes(UserRole.ADMIN)) {
    //   return `/${proxy}/admin/ajobs`;
    // } else {
    //   return `/${proxy}/candidate/profile`;
    // }
  };
  const profilePath = getProfilePath();
  // const profilePath = userDetails?.lastAccessedDash === "CAND" ? `/${proxy}/candidate/profile` : `/${proxy}/employee/profile`;
  const dashPath = profilePath;

  const getMiscUserPosition = (): string => {
    if (userType?.includes(UserRole.CORPORATE)) {
      const type = secureStorage.getItem<UserRole>(SecureStorageKeyEnum.CORPORATEUSERTYPE);
      switch (type) {
        case UserRole.CORPORATE_ADMIN:
          return "Admin";
        case UserRole.CORPORATE_RECRUITER:
          return "Recruiter";
        default:
          return "Corporate User";
      }
    }

    if (userType?.includes(UserRole.EVALUATOR)) {
      return "Evaluator";
    }

    return "User";
  };

  return (
    <div
      className={`
       h-16 w-full bg-white  shadow-sm border-b border-gray-200"}
    `}>
      <header
        className={cn(
          "z-[999] fixed left-1/2 transform -translate-x-1/2 transition-[width,top] duration-500 ease-in-out",
          isScrolled
            ? `top-[10px] w-[95vw] bg-white/60 backdrop-blur-md shadow-xl rounded-full ${
                isOpen && isScrolled ? "max-sm:rounded-b-none max-sm:rounded-t-3xl" : ""
              } border border-gray/20`
            : "top-0 w-full bg-white shadow-sm border-b border-gray-200"
        )}
        id="header_main_body"
        ref={headerRef}
        style={
          isScrolled
            ? {}
            : {
                borderImage: "linear-gradient(90deg, #fafcfd, #0041a8, #fafcfd) 1",
              }
        }>
        <div
          className={`
        max-w-6xl mx-auto flex justify-between items-center px-4 h-16
        ${isScrolled ? "px-6" : ""}
      `}>
          {/* Logo */}
          <div
            className={`cursor-pointer w-24 `}
            onClick={() => {
              navigateTo("/");
              setUpdateCheck(true);
            }}>
            <img src={logo_text} alt="Logo" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <ul className="flex gap-6 list-none font-medium">
              {navItems.map((item) => (
                <li
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}>
                  <a
                    onClick={() => navigateTo(item.href || "#")}
                    className="text-sm font-normal text-black-500 hover:text-blue-600 flex items-center gap-2 cursor-pointer py-2 relative transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full">
                    {item.label}
                    {item.subItems && (
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    )}
                  </a>
                  {item.subItems && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-max z-25 border text-left border-gray-100">
                      {item.subItems.map((subItem) => (
                        <a
                          key={subItem.label}
                          onClick={() => navigateTo(subItem.href)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center min-w-fit">
            {isLoggedIn ? (
              <div className="group relative">
                <div className="flex items-center gap-4 cursor-pointer px-4 py-2 rounded-lg max-h-14 group-hover:bg-blue-50 transition-colors duration-200">
                  <div onClick={() => appHref(profilePath)} className="cursor-pointer">
                    {userDetails?.profileImageAwsS3SignedUrl && !imgError ? (
                      <img
                        onError={() => setImgError(true)}
                        className="border border-gray-400 w-9 h-9 object-cover rounded-full"
                        src={userDetails?.profileImageAwsS3SignedUrl}
                      />
                    ) : userDetails?.fullName ? (
                      <span className="text-gray-400 border border-gray-400 w-9 h-9 rounded-full flex items-center justify-center font-bold">
                        {userDetails.fullName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="text-gray-400 border border-gray-400 p-1 w-9 h-9 rounded-full" />
                    )}
                  </div>
                  <i
                    className="fas fa-chevron-down cursor-pointer text-gray-500"
                    onClick={() => CognitoServiceObj.handleSignOut()}></i>
                </div>

                {/* User Dropdown */}
                <div className="absolute top-14 right-0 min-w-[250px] bg-white rounded-md p-2 shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                  <ul className="mt-2 text-left p-2">
                    <li className="flex items-center justify-between rounded-lg bg-white">
                      <div className="flex items-center w-full gap-2">
                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full border border-gray-400 bg-gray-100 font-bold overflow-hidden flex items-center justify-center text-gray-400">
                          {userDetails?.profileImageAwsS3SignedUrl && !imgError ? (
                            <img
                              className="w-full h-full object-cover"
                              src={userDetails?.profileImageAwsS3SignedUrl}
                              onError={() => setImgError(true)}
                              alt="User Avatar"
                            />
                          ) : userDetails?.fullName ? (
                            userDetails.fullName.charAt(0).toUpperCase()
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex flex-col flex-1">
                          <h5 className="text-sm font-semibold text-gray-900 capitalize mb-1">
                            {userDetails?.fullName || "user"}
                          </h5>
                          {userType?.includes(UserRole.GENERAL_USER) ||
                          userType?.includes(UserRole.LINKEDIN) ||
                          userType?.includes(UserRole.ADMIN) ? (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-sm font-bold text-gray-500 max-w-[100px] truncate flex items-center">
                                <img src={coin} className="inline mr-1 w-4 h-4 object-contain" />
                                {userDetails?.referralCount || 0}
                              </span>
                              <span
                                className="cursor-pointer font-medium text-sm text-blue-500 hover:underline"
                                onClick={() => appHref(`/${proxy}/candidate/subscription`)}>
                                + Referrals
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-500 max-w-[100px] flex items-center">
                              <i className="fa-solid fa-user-tie mr-2"></i>
                              {getMiscUserPosition()}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>

                    <hr className="my-3" />

                    {/* Personal Section */}
                    <li className="mb-2">
                      <span className="text-sm font-semibold text-gray-400 cursor-default">
                        Personal
                      </span>
                    </li>
                    <li className="mb-1">
                      <div
                        onClick={() => appHref(profilePath)}
                        className="block py-1 w-full text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer px-2 rounded hover:bg-blue-50 transition-colors duration-200">
                        Edit Profile
                      </div>
                      {/* below is the code where we used evaluator earlier remove the above div with edit profile and uncomment below */}
                      {/* {!userType?.includes(UserRole.EVALUATOR) ? (
                        <div onClick={() => appHref(profilePath)} className="block py-1 w-full text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer px-2 rounded hover:bg-blue-50 transition-colors duration-200">
                          Edit Profile
                        </div>
                      ) : (
                        <div onClick={() => appHref(`/${proxy}/evaluator-dashboard/?evaluatorEmail=${encodeURIComponent(userDetails?.email || "")}`)} className="block py-1 w-full text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer px-2 rounded hover:bg-blue-50 transition-colors duration-200">
                          Evaluator Dashboard
                        </div>
                      )} */}
                    </li>
                    <li className="mb-1">
                      <div
                        onClick={() => appHref(dashPath)}
                        className="block py-1 w-full text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer px-2 rounded hover:bg-blue-50 transition-colors duration-200">
                        Dashboard
                      </div>
                    </li>

                    <hr className="my-3" />

                    {/* Actions Section */}
                    <li className="mb-2">
                      <span className="text-sm font-semibold text-gray-400 cursor-default">
                        Actions
                      </span>
                    </li>
                    <li>
                      <a
                        onClick={() => {
                          CognitoServiceObj.handleSignOut();
                          setUpdateCheck((prev) => !prev);
                        }}
                        className="block py-1 w-full text-sm font-medium text-gray-800 hover:text-red-600 cursor-pointer px-2 rounded hover:bg-red-50 transition-colors duration-200">
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <>
                  <button
                    className="btn_t1 login hover:!bg-blue-500/10 hover:border-blue-500 "
                    onClick={() => navigateTo("/auth/login")}>
                    Login
                  </button>
                  <button className="btn_t1 signup" onClick={() => navigateTo("/auth/signup")}>
                    Sign-up for free
                  </button>
                </>
                <>
                  {/* verticle hr */}
                  <div className="w-[1px] h-8 bg-blue-500 mx-2"></div>
                </>
                <div className="corporete-login">
                  <button
                    className="rounded-xl bg-sky-400/30 border-sky-600 hover:border-2 py-2 px-3 text-sm font-semibold text-blue-700"
                    onClick={() => navigateTo("/auth/corporate/login")}>
                    For Employers
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-800">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute rounded-b-2xl overflow-hidden top-full left-0 w-full bg-white shadow-lg border-t  border-gray-200 z-50 transition-all ease-in-out duration-300">
            {isLoggedIn && (
              <div className="flex flex-col items-start gap-4 p-4 border-b border-gray-200">
                <div className="flex font-bold justify-between items-center w-full">
                  <span
                    className="flex-1 flex items-center cursor-pointer"
                    onClick={() => appHref(profilePath)}>
                    {userDetails?.profileImageAwsS3SignedUrl && !imgError ? (
                      <img
                        className="w-8 h-8 object-cover rounded-lg border border-gray-400"
                        onError={() => setImgError(true)}
                        src={userDetails?.profileImageAwsS3SignedUrl}
                        alt="User Avatar"
                      />
                    ) : userDetails?.fullName ? (
                      <span className="text-gray-400 border border-gray-400 w-8 h-8 rounded-full flex items-center justify-center">
                        {userDetails.fullName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-8 h-8 border border-gray-400 rounded-lg" />
                    )}
                    <h4 className="text-lg font-semibold capitalize px-2">
                      {userDetails?.fullName || "user"}
                    </h4>
                  </span>
                  <LogOut
                    className="cursor-pointer text-red-500 w-5 h-5"
                    onClick={() => {
                      CognitoServiceObj.handleSignOut();
                      setUpdateCheck((prev) => !prev);
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 flex items-center">
                  <img src={coin} className="inline mr-1 w-4 h-4 object-contain" />
                  {userDetails?.referralCount || 0} Referrals Left
                </span>
                <a
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  onClick={() => appHref(dashPath)}>
                  Dashboard
                </a>
              </div>
            )}

            <nav className="flex flex-col p-4 bg-white">
              {navItems.map((item) => (
                <div key={item.label} className="mb-3">
                  <button
                    onClick={() => {
                      toggleDropdown(item.label);
                      if (item.href) navigateTo(item.href);
                    }}
                    className="flex justify-between items-center w-full text-left text-base cursor-pointer py-2 text-gray-700 hover:text-blue-600">
                    {item.label}
                    {item.subItems && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  {item.subItems && activeDropdown === item.label && (
                    <div className="mt-2 pl-4">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.label}
                          onClick={() => navigateTo(subItem.href)}
                          className="block py-2 text-gray-600 hover:text-blue-600 w-full text-left">
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {!isLoggedIn && (
              <div className="flex flex-col items-center p-4 w-[300px] mx-auto gap-3">
                <button
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => navigateTo("/auth/login")}>
                  Login
                </button>
                <button
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => navigateTo("/auth/signup")}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
