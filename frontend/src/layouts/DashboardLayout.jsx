import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-slate-200 overflow-hidden font-sans">
            <Sidebar />
            
            {/* Mobile Sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div 
                        className="absolute left-0 top-0 h-full w-64 bg-surface shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <Sidebar />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
