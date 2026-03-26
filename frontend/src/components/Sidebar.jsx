import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Server, Settings, Users, Activity } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Devices', icon: Server, path: '/devices' },
    { label: 'Telemetry', icon: Activity, path: '/telemetry' },
    { label: 'Users', icon: Users, path: '/users', requiredRoles: ['admin'] },
    { label: 'Settings', icon: Settings, path: '/settings', requiredRoles: ['admin'] },
];

export default function Sidebar() {
    const { hasRole } = useAuth();
    return (
        <aside className="w-64 h-screen bg-surface border-r border-slate-700/50 flex flex-col hidden md:flex sticky top-0">
            <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Anedya Logo" className="w-8 h-8 rounded object-cover shadow-lg" />
                    <span className="text-xl font-semibold tracking-wide text-white">Anedya IoT</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navItems
                    .filter(item => !item.requiredRoles || hasRole(item.requiredRoles))
                    .map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200',
                                isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <div className="bg-slate-800/50 rounded-lg p-3 text-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-300 font-medium">System Status</p>
                        <p className="text-accent text-xs flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow"></span>
                            All Systems Operational
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
