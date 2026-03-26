import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, UserCircle, Menu, LogOut, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { useDevices } from '../hooks/useDevices';

// ─── Notification helpers ───────────────────────────────────────────────────
function buildNotifications(devices) {
    if (!devices || devices.length === 0) return [];
    const notes = [];
    const offline = devices.filter(d => !d.isOnline);
    const relayOn = devices.filter(d => d.relayState);

    offline.forEach(d =>
        notes.push({ id: `off-${d._id}`, type: 'warning', title: 'Device Offline', body: `${d.name} has not reported in over 5 minutes.`, time: 'just now' })
    );
    relayOn.forEach(d =>
        notes.push({ id: `relay-${d._id}`, type: 'info', title: 'Relay Active', body: `${d.name} relay is currently ON.`, time: 'ongoing' })
    );
    if (notes.length === 0)
        notes.push({ id: 'ok', type: 'success', title: 'All Systems Normal', body: 'All registered devices are online and healthy.', time: 'just now' });

    return notes;
}

const iconMap = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    info:    <Info className="w-4 h-4 text-blue-400" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
};

const bgMap = {
    warning: 'bg-amber-500/10 border-amber-500/20',
    info:    'bg-blue-500/10 border-blue-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const { devices } = useDevices();
    const [showNotifications, setShowNotifications] = useState(false);
    const [dismissed, setDismissed] = useState(new Set());
    const panelRef = useRef(null);

    const allNotes = buildNotifications(devices);
    const visible  = allNotes.filter(n => !dismissed.has(n.id));
    const unread   = visible.length;

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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

            <div className="flex items-center gap-3">
                {/* Bell notification button */}
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={() => setShowNotifications(p => !p)}
                        className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800"
                    >
                        <Bell className={clsx('w-5 h-5 transition-transform', showNotifications && 'scale-110 text-slate-200')} />
                        {unread > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-surface flex items-center justify-center text-[9px] font-bold text-white">
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>

                    {/* Notification dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                                <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                                {unread > 0 && (
                                    <button
                                        onClick={() => setDismissed(new Set(allNotes.map(n => n.id)))}
                                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                {visible.length === 0 ? (
                                    <div className="flex flex-col items-center py-8 text-slate-500">
                                        <CheckCircle className="w-8 h-8 mb-2 text-emerald-500/40" />
                                        <p className="text-sm">All caught up!</p>
                                    </div>
                                ) : (
                                    visible.map(note => (
                                        <div key={note.id} className={clsx('flex items-start gap-3 px-4 py-3 border-b border-slate-800 last:border-0', bgMap[note.type], 'border-l-2')}>
                                            <div className="mt-0.5 shrink-0">{iconMap[note.type]}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-200">{note.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{note.body}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{note.time}</p>
                                            </div>
                                            <button
                                                onClick={() => setDismissed(p => new Set([...p, note.id]))}
                                                className="p-0.5 text-slate-600 hover:text-slate-400 transition-colors shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-700/50 mx-1" />

                {/* User info */}
                <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg">
                    <UserCircle className="w-7 h-7 text-slate-400" />
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-slate-200 leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-none capitalize">{user?.role || 'Guest'}</p>
                    </div>
                </div>

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
