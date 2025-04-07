import Header from '@Components/Dashboard/Header';
import Sidebar from '@Components/Dashboard/Sidebar';
import { Bell, ChevronRight, Menu, Star, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

/**
 * @function DashboardLayout
 *
 * @description A DashboardLayout component for nested routes
 *
 * @returns {JSX.Element} The JSX code for the DashboardLayout component
 */
function DashboardLayout(): JSX.Element {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div id="DashboardLayout">
            <div className="min-h-screen grid grid-cols-[212px_1fr] max-sm:grid-cols-1">
                {/* Sidebar */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Main Content */}
                <div className="flex flex-col">
                    {/* Header */}
                    <Header 
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                    {/* Page Content */}
                    <main className="flex-1 p-4">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;
