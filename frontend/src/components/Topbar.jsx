import React from 'react';
import { Bell, Search, UserCircle, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    
    return (
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search devices..."
                        className="bg-slate-900/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all w-64 placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
                </button>
                
                <div className="h-8 w-px bg-slate-700/50 mx-1"></div>
                
                <button className="flex items-center gap-2 hover:bg-slate-800 py-1.5 px-2 rounded-lg transition-colors group">
                    <UserCircle className="w-7 h-7 text-slate-400" />
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-slate-200 leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-none capitalize">{user?.role || 'Guest'}</p>
                    </div>
                </button>
                <button 
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800 ml-1"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
