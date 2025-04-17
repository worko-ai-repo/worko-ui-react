import React, { useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import {
    ChevronRight,
} from 'lucide-react';
import { Applicants, Bulk_CV, Home, Invites, Job, Referral, Support, User } from "@Assets";
import { useAppContext } from '@Context/App.context';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '@Context/Dashboard.context';

type Tab =
    | 'home'
    | 'jobs'
    | 'invites'
    | 'applicants'
    | 'interviews'
    | 'hire'
    | 'bulk-cv-check'
    | 'referrals'
    | 'invoice-&-payment'
    | 'support';
interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (open: boolean) => void;
}
interface NavItem {
    id: Tab;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <img src={Home} className="w-5 h-5" /> },
    { id: 'jobs', label: 'Jobs', icon: <img src={Job} className="w-5 h-5" /> },
    { id: 'applicants', label: 'Applicants', icon: <img src={Applicants} className="w-5 h-5" /> },
    { id: 'bulk-cv-check', label: 'Bulk CV Check', icon: <img src={Bulk_CV} className="w-5 h-5" /> },
    { id: 'invites', label: 'Invites', icon: <img src={Invites} className="w-5 h-5" /> },
    { id: 'referrals', label: 'Referral', icon: <img src={Referral} className="w-5 h-5" /> },
    { id: 'support', label: 'Support', icon: <img src={Support} className="w-5 h-5" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) => {
    const { userDetails } = useAppContext();
    const { activeTab, setActiveTab } = useDashboardContext();
    const navigate = useNavigate();
    const dashboardType = location.pathname.split('/')[2] || 'corporate';

    useEffect(() => {
        const currentTab = location.pathname.split('/')[3];
        if (currentTab) {
            setActiveTab(currentTab as Tab);
        }
    }, [location.pathname]);

    const Avatar = (
        <div className="rounded-full text-[#316bff] w-8 h-8 flex items-center justify-center">
            <img src={User} alt="User" className="w-full h-full object-cover rounded-full" />
        </div>
    );

    return (
        <aside
            className={`bg-[#316bff] text-white h-screen z-40 transition-all duration-300 ease-in-out p-4 rounded-r-3xl
                ${collapsed ? 'w-[72px]' : 'w-[212px]'}
                sm:relative sm:block
                max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:w-[320px] 
                ${sidebarOpen ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'}`}
        >

            <div className="flex justify-between items-center mb-6">
                {!collapsed ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {Avatar}
                            <span className="text-base text-start font-bold capitalize">{userDetails?.name}</span>
                        </div>

                        <button
                            onClick={() => setCollapsed(true)}
                            className="hidden sm:flex focus:outline-none"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="block sm:hidden focus:outline-none"
                            aria-label="Close sidebar"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                        {Avatar}
                    </div>
                )}
            </div>

            <nav className="space-y-3">
                {navItems.map((item) => {
                    const isActive = item.id === activeTab;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                navigate(`/dashboards/${dashboardType}/${item.id}`);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2 transition-all rounded-lg
                                ${isActive ? 'bg-white text-[#316bff] shadow-sm' : 'hover:bg-blue-600'}
                                ${collapsed ? 'justify-center' : 'justify-between'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`p-1 rounded-lg ${isActive ? "bg-gray-100 text-[#316bff]" : "bg-blue-600 text-white"}`}>
                                    {item.icon}
                                </span>
                                {!collapsed && (
                                    <span className="text-[13px] font-medium whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            {!collapsed && (
                                <span className={`${isActive ? 'bg-gray-100 rounded-md p-1' : ''}`}>
                                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-gray-400' : 'text-blue-300'}`} />
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {collapsed && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => setCollapsed(false)}
                        className="text-white focus:outline-none"
                        aria-label="Expand sidebar"
                    >
                        <ChevronLeftIcon
                            className="w-5 h-5 rotate-180"
                        />
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;