import { Bell, Menu, Star } from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const navItem = segments[2] ? capitalize(segments[2]) : 'Home';

  const getDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <header className="h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <button className="sm:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="w-6 h-6 text-black" />
        </button>

        <div className="hidden sm:flex text-sm items-center space-x-4">
          <Star className="text-[#316bff] w-5 h-5" />
          <span className="text-gray-500">Dashboards</span>
          <span>/</span>
          <span className="font-medium">{navItem}</span>
        </div>
      </div>

      <div className="space-x-8 text-[#316bff] font-semibold">
        <span>{getDate()}</span>
        <button className="bg-white p-2 shadow-lg rounded-lg relative">
          <Bell className="w-5 h-5 text-[#316bff]" />
        </button>
      </div>
    </header>
  );
};

export default Header;
