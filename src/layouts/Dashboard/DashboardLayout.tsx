import Header from '@Components/Dashboard/Header';
import Sidebar from '@Components/Dashboard/Sidebar';
import { DashboardProvider } from '@Context/Dashboard.context';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

function DashboardLayout(): JSX.Element {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr]">
            <DashboardProvider>
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
                
                <div className="grid grid-rows-[auto_1fr] h-screen">
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                    <main className="overflow-auto p-8 pt-2">
                        <Outlet />
                    </main>
                </div>
            </DashboardProvider>
        </div>
    );
}

export default DashboardLayout;
