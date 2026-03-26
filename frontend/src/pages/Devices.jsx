import React, { useState } from 'react';
import { Server, Wifi, WifiOff, Power, Search, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useDevices } from '../hooks/useDevices';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DeviceCardSkeleton } from '../components/Skeleton';

function StatusBadge({ isOnline }) {
    return (
        <span className={clsx(
            'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
            isOnline
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-slate-700/60 text-slate-400 ring-1 ring-slate-600/30'
        )}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500')} />
            {isOnline ? 'Online' : 'Offline'}
        </span>
    );
}

function RelayBadge({ state }) {
    return (
        <span className={clsx(
            'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
            state
                ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30'
                : 'bg-slate-700/60 text-slate-400 ring-1 ring-slate-600/30'
        )}>
            <Power className="w-3 h-3" />
            {state ? 'ON' : 'OFF'}
        </span>
    );
}

function formatLastSeen(dateStr) {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}

export default function Devices() {
    const { devices, isLoading, isError, mutate } = useDevices();
    const { hasPermission } = useAuth();
    const canToggle = hasPermission('relay:toggle');

    const [search, setSearch] = useState('');
    const [togglingId, setTogglingId] = useState(null);

    const filtered = (devices || []).filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.deviceId.toLowerCase().includes(search.toLowerCase())
    );

    const handleRelayToggle = async (device) => {
        if (!canToggle || togglingId) return;
        setTogglingId(device._id);
        const newState = !device.relayState;
        try {
            await api.post(`/devices/${device._id}/relay`, { state: newState });
            toast.success(`${device.name}: Relay turned ${newState ? 'ON' : 'OFF'}`);
            mutate();
        } catch {
            toast.error('Failed to toggle relay.');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Devices</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage and control your registered IoT devices.
                    </p>
                </div>
                <button
                    onClick={() => mutate()}
                    className="btn-primary flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                    <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
                    Refresh
                </button>
            </div>

            {/* Search bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name or device ID…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                />
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
                {isLoading && !devices ? (
                    <div className="p-4 space-y-4">
                        {[...Array(4)].map((_, i) => <DeviceCardSkeleton key={i} />)}
                    </div>
                ) : isError ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                        <p className="text-slate-300 font-medium">Failed to load devices</p>
                        <button onClick={() => mutate()} className="mt-4 btn-primary text-sm">Try Again</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <Cpu className="w-10 h-10 text-slate-500 mb-3" />
                        <p className="text-slate-300 font-medium">No devices found</p>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your search or refresh the list.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700/50 text-left">
                                    <th className="px-5 py-3.5 text-slate-400 font-medium">Device</th>
                                    <th className="px-5 py-3.5 text-slate-400 font-medium">Device ID</th>
                                    <th className="px-5 py-3.5 text-slate-400 font-medium">Status</th>
                                    <th className="px-5 py-3.5 text-slate-400 font-medium">Relay</th>
                                    <th className="px-5 py-3.5 text-slate-400 font-medium">Last Seen</th>
                                    {canToggle && (
                                        <th className="px-5 py-3.5 text-slate-400 font-medium text-right">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {filtered.map(device => (
                                    <tr key={device._id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                                    device.isOnline ? 'bg-emerald-500/15' : 'bg-slate-700/60'
                                                )}>
                                                    <Server className={clsx('w-4 h-4', device.isOnline ? 'text-emerald-400' : 'text-slate-500')} />
                                                </div>
                                                <span className="font-medium text-slate-200">{device.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <code className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">{device.deviceId}</code>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge isOnline={device.isOnline} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <RelayBadge state={device.relayState} />
                                        </td>
                                        <td className="px-5 py-4 text-slate-400 text-xs">
                                            {formatLastSeen(device.lastSeen)}
                                        </td>
                                        {canToggle && (
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => handleRelayToggle(device)}
                                                    disabled={togglingId === device._id}
                                                    className={clsx(
                                                        'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
                                                        togglingId === device._id
                                                            ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400'
                                                            : device.relayState
                                                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 ring-1 ring-red-500/30'
                                                                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 ring-1 ring-emerald-500/30'
                                                    )}
                                                >
                                                    <Power className="w-3.5 h-3.5" />
                                                    {togglingId === device._id ? 'Toggling…' : device.relayState ? 'Turn OFF' : 'Turn ON'}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer count */}
            {devices && (
                <p className="text-slate-500 text-xs text-right">
                    Showing {filtered.length} of {devices.length} device{devices.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
