import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Thermometer, Droplets, Zap, WifiOff, Wifi, Power } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const iconMap = {
    temperature: Thermometer,
    humidity:    Droplets,
    power:       Zap,
    default:     Activity,
};

// onRelayChange: optional callback to notify parent (e.g. to recount active devices)
export default function DeviceCard({ _id, name, isOnline, telemetry, relayState, onRelayChange }) {
    const auth = useAuth();
    const canToggle = auth.hasPermission
        ? auth.hasPermission('relay:toggle')
        : auth.hasRole(['Admin', 'Operator']);

    // ── Keep localRelay in sync with server-driven prop changes ──────────────
    // Without this, toggling from the Devices page wouldn't update Dashboard cards.
    const [localRelay, setLocalRelay] = useState(relayState || false);
    const [isBusy,     setIsBusy]     = useState(false);
    const [isReverting, setIsReverting] = useState(false);

    useEffect(() => {
        setLocalRelay(relayState || false);
    }, [relayState]);

    const handleRelayToggle = useCallback(async () => {
        if (!canToggle || isBusy) return;

        const previousState = localRelay;
        const newState = !localRelay;

        // Optimistic UI update
        setLocalRelay(newState);
        setIsBusy(true);

        try {
            await api.post(`/devices/${_id}/relay`, { state: newState });
            toast.success(`Relay turned ${newState ? 'ON' : 'OFF'} successfully`);
            // Notify parent so SWR cache is revalidated globally (stat cards recount)
            if (onRelayChange) onRelayChange();
        } catch {
            setIsReverting(true);
            setLocalRelay(previousState);
            toast.error('Failed to toggle relay. Device might be unreachable.');
            setTimeout(() => setIsReverting(false), 400);
        } finally {
            setIsBusy(false);
        }
    }, [canToggle, isBusy, localRelay, _id, onRelayChange]);

    return (
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
            {/* Status indicator glow */}
            <div className={clsx(
                'absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20',
                isOnline ? 'bg-accent' : 'bg-red-500'
            )} />

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
                            'text-xs font-medium',
                            isOnline ? 'text-accent' : 'text-slate-400'
                        )}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* Relay status pill */}
                <span className={clsx(
                    'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1',
                    localRelay
                        ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30'
                        : 'bg-slate-700/60 text-slate-500'
                )}>
                    <Power className="w-3 h-3" />
                    {localRelay ? 'Relay ON' : 'Relay OFF'}
                </span>
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
                        disabled={isBusy}
                        className={clsx(
                            'flex-1 py-2 text-sm font-medium rounded-lg flex justify-center items-center gap-2 transition-all duration-200',
                            isBusy       ? 'opacity-50 cursor-not-allowed' : '',
                            isReverting  ? 'animate-pulse' : '',
                            localRelay
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        )}
                    >
                        <Power className={clsx('w-4 h-4', isBusy && 'animate-spin')} />
                        {isBusy ? 'Updating…' : localRelay ? 'Turn Off Relay' : 'Turn On Relay'}
                    </button>
                )}
                <button className="flex-1 btn-primary py-2 text-sm">Details</button>
            </div>
        </div>
    );
}
