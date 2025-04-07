import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
    Home,
    Briefcase,
    Users,
    ClipboardCheck,
    Mail,
    UserPlus,
    HelpCircle,
    ChevronRight,
} from 'lucide-react';
import { useAppContext } from '@Context/App.context';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5 transition-none" /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5 transition-none" /> },
    { id: 'applicants', label: 'Applicants', icon: <Users className="w-5 h-5 transition-none" /> },
    { id: 'bulk-cv-check', label: 'Bulk CV Check', icon: <ClipboardCheck className="w-5 h-5 transition-none" /> },
    { id: 'invites', label: 'Invites', icon: <Mail className="w-5 h-5 transition-none" /> },
    { id: 'referrals', label: 'Referral', icon: <UserPlus className="w-5 h-5 transition-none" /> },
    { id: 'support', label: 'Support', icon: <HelpCircle className="w-5 h-5 transition-none" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const [activeTab, setActiveTab] = useState<string>('home');
    const { userDetails } = useAppContext();
    const navigate = useNavigate();
    const dashboardType = location.pathname.split('/')[2] || 'corporate'; // fallback if needed

    useEffect(() => {
        const currentTab = location.pathname.split('/')[3]; // get 'home', 'jobs', etc.
        if (currentTab) {
            setActiveTab(currentTab);
        }
    }, [location.pathname]);

    function capitalizeFirstLetter(str: string) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <aside
            className={`bg-[#316bff] max-w-[212px] text-white rounded-r-3xl p-4 max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:h-full max-sm:z-50 transition-transform duration-300 ${sidebarOpen ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'
                }`}
        >
            {/* Top Section: Avatar / Name / Close Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    {/* Example Avatar Icon (Lucide) - Replace with an actual image if desired */}
                    <div className="bg-white rounded-full text-[#316bff] w-8 h-8 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold">{capitalizeFirstLetter(userDetails?.name)}</span>
                </div>
                {/* Close button appears only on mobile screens */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="block sm:hidden focus:outline-none"
                    aria-label="Close sidebar"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const isActive = item.id === activeTab;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id)
                                navigate(`/dashboards/${dashboardType}/${item.id}`);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2 transition-none rounded-lg ${isActive
                                ? 'bg-white text-[#316bff] shadow-sm'
                                : 'hover:bg-blue-600'
                                }`}
                        >
                            {/* Left side: icon + label */}
                            <div className="flex items-center gap-3 overflow-hidden">
                                {item.icon}
                                <span className="text-[13px] font-medium whitespace-nowrap">
                                    {item.label}
                                </span>
                            </div>

                            {/* Right side: arrow icon */}
                            <span className={`${isActive ? 'bg-gray-100 rounded-md p-1' : ''}`}>
                                <ChevronRight
                                    className={`w-4 h-4 ${isActive ? 'text-gray-400' : 'text-blue-300'}`}
                                />
                            </span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
