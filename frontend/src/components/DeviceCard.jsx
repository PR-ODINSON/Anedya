import React, { useState } from 'react';
import { Activity, Thermometer, Droplets, Zap, WifiOff, Wifi, Power } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const iconMap = {
    temperature: Thermometer,
    humidity: Droplets,
    power: Zap,
    default: Activity,
};

export default function DeviceCard({ _id, name, isOnline, telemetry, relayState }) {
    const { hasRole } = useAuth();
    // Use fallback array since permission checks handle actual auth
    // Wait, requirement: Admin, Operator have relay control. Viewer does not.
    // AuthContext hasRole uses roles. But requirement says "Render UI based on permissions (not just roles)".
    // So let's create a usePermissions hook or just use hasPermission context. But we don't have it yet!
    // Let's rely on roles for UI hide/show, or introduce a mock permission check if not available.
    // Actually, role-based hiding is fine here as long as backend provides permission-level security, but prompt said "Replace role-based checks with permission-based system ... Frontend: Render UI based on permissions (not just roles)".
    // So let's check `hasPermission` from AuthContext! (I need to add `hasPermission` to AuthContext later).
    
    const [localRelay, setLocalRelay] = useState(relayState || false);
    const [isReverting, setIsReverting] = useState(false);
    
    // We will assume `hasPermission('relay:toggle')` is available from AuthContext
    const auth = useAuth();
    const canToggle = auth.hasPermission ? auth.hasPermission('relay:toggle') : auth.hasRole(['Admin', 'Operator']);

    const handleRelayToggle = async () => {
        if (!canToggle) return;
        
        const previousState = localRelay;
        const newState = !localRelay;
        
        // Optimistic UI Update
        setLocalRelay(newState);
        
        try {
            await api.post(`/devices/${_id}/relay`, { state: newState });
            toast.success(`Relay turned ${newState ? 'ON' : 'OFF'} successfully`);
        } catch (error) {
            // Rollback on failure
            setIsReverting(true);
            setLocalRelay(previousState);
            // Error is already toasted globally by api.js, but we can be specific
            toast.error('Failed to toggle relay. Device might be unreachable.');
            setTimeout(() => setIsReverting(false), 400); // clear shake animation
        }
    };

    return (
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
            {/* Status indicator glow */}
            <div className={clsx(
                "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20",
                isOnline ? "bg-accent" : "bg-red-500"
            )}></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-100">{name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        {isOnline ? (
                            <Wifi className="w-3.5 h-3.5 text-accent animate-pulse" />
                        ) : (
                            <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className={clsx(
                            "text-xs font-medium",
                            isOnline ? "text-accent" : "text-slate-400"
                        )}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mt-4">
                {telemetry && Object.entries(telemetry).map(([key, value]) => {
                    const Icon = iconMap[key.toLowerCase()] || iconMap.default;
                    return (
                        <div key={key} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-slate-700/50 text-slate-300">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-slate-300 capitalize">{key}</span>
                            </div>
                            <span className="text-sm font-semibold text-white">{value}</span>
                        </div>
                    );
                })}
                {(!telemetry || Object.keys(telemetry).length === 0) && (
                    <div className="text-sm text-slate-500 italic py-2">No active telemetry</div>
                )}
            </div>
            
            <div className="mt-5 flex gap-2">
                {canToggle && (
                    <button 
                        onClick={handleRelayToggle}
                        className={clsx(
                            "flex-1 py-2 text-sm font-medium rounded-lg flex justify-center items-center gap-2 transition-all duration-200",
                            isReverting ? "animate-pulse" : "",
                            localRelay ? "bg-accent/20 text-accent hover:bg-accent/30" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        )}
                    >
                        <Power className="w-4 h-4" />
                        {localRelay ? 'Turn Off Relay' : 'Turn On Relay'}
                    </button>
                )}
                <button className="flex-1 btn-primary py-2 text-sm">Details</button>
            </div>
        </div>
    );
}
