import React, { useMemo, useState, useCallback } from 'react';
import DeviceCard from '../components/DeviceCard';
import TelemetryChart from '../components/TelemetryChart';
import { DeviceCardSkeleton } from '../components/Skeleton';
import { Activity, Server, AlertTriangle, AlertCircle, RefreshCw, Cpu, Download, CheckCircle } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import toast from 'react-hot-toast';

// Generate realistic mock telemetry for dashboard overview charts
function makeMockData(base, range, points = 24) {
    let value = base;
    return Array.from({ length: points }, (_, i) => {
        value += (Math.random() - 0.49) * range * 0.2;
        value = Math.max(base - range, Math.min(base + range, value));
        const ts = new Date(Date.now() - (points - i) * 3600000 / points);
        return {
            time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: parseFloat(value.toFixed(1)),
            power: parseFloat((value * 0.14).toFixed(2)),
        };
    });
}


export default function Dashboard() {
    const { devices, isLoading, isError, mutate } = useDevices();
    const mockData = useMemo(() => makeMockData(24, 8, 24), []);
    const [syncing, setSyncing] = useState(false);
    const [reportDone, setReportDone] = useState(false);

    // Sync Data: revalidate SWR + show brief feedback
    const handleSync = useCallback(async () => {
        setSyncing(true);
        await mutate();
        setTimeout(() => setSyncing(false), 1500);
        toast.success('Device data synced successfully!');
    }, [mutate]);

    // Generate Report: build a CSV from live device data
    const handleReport = useCallback(() => {
        if (!devices || devices.length === 0) {
            toast.error('No device data to export.');
            return;
        }
        const headers = ['Device ID', 'Name', 'Status', 'Relay State', 'Last Seen'];
        const rows = devices.map(d => [
            d.deviceId,
            `"${d.name}"`,
            d.isOnline ? 'Online' : 'Offline',
            d.relayState ? 'ON' : 'OFF',
            new Date(d.lastSeen).toLocaleString(),
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `anedya_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setReportDone(true);
        toast.success('Report downloaded!');
        setTimeout(() => setReportDone(false), 2000);
    }, [devices]);

    // Aggregate stats dynamically
    const totalDevices = devices ? devices.length : 0;
    const activeDevices = devices ? devices.filter(d => d.isOnline).length : 0;
    // Assuming a critical alert logic based on offline status for critical devices or generic logic
    const criticalAlerts = devices ? devices.filter(d => !d.isOnline).length : 0;

    const renderDeviceContent = () => {
        if (isLoading && !devices) {
            return (
                <>
                    <DeviceCardSkeleton />
                    <DeviceCardSkeleton />
                    <DeviceCardSkeleton />
                    <DeviceCardSkeleton />
                </>
            );
        }

        if (isError) {
            return (
                <div className="glass-panel p-8 text-center border-red-500/30 flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white">Failed to load devices</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-4">There was an error communicating with the server.</p>
                    <button onClick={() => mutate()} className="btn-primary flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            );
        }

        if (!devices || devices.length === 0) {
            return (
                <div className="glass-panel p-8 text-center flex flex-col items-center">
                    <Cpu className="w-12 h-12 text-slate-500 mb-3" />
                    <h3 className="text-lg font-semibold text-white">No Devices Found</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-4">Register your first device in Anedya Cloud to start monitoring.</p>
                    <button className="btn-primary" onClick={() => mutate()}>Refresh List</button>
                </div>
            );
        }

        return devices.map(device => (
            <DeviceCard
                key={device._id || device.deviceId}
                {...device}
                onRelayChange={mutate}
            />
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">System Overview</h1>
                    <p className="text-slate-400 text-sm mt-1">Monitor your IoT infrastructure in real-time.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="btn-primary flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing…' : 'Sync Data'}
                    </button>
                    <button
                        onClick={handleReport}
                        className="btn-primary flex items-center gap-2 transition-all"
                    >
                        {reportDone
                            ? <><CheckCircle className="w-4 h-4" /> Downloaded!</>
                            : <><Download className="w-4 h-4" /> Generate Report</>
                        }
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-5 flex items-center gap-4">
                    <div className="p-3 bg-primary/20 text-primary rounded-lg">
                        <Server className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Devices</p>
                        <h4 className="text-2xl font-bold text-white mt-1">{totalDevices}</h4>
                    </div>
                </div>
                <div className="glass-panel p-5 flex items-center gap-4">
                    <div className="p-3 bg-accent/20 text-accent rounded-lg">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Active Devices</p>
                        <h4 className="text-2xl font-bold text-white mt-1">{activeDevices}</h4>
                    </div>
                </div>
                <div className="glass-panel p-5 flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 text-red-500 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Offline Devices</p>
                        <h4 className="text-2xl font-bold text-white mt-1">{criticalAlerts}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <TelemetryChart
                        title="Average Temperature (°C) — Last 24 h"
                        data={mockData}
                        dataKey="temperature"
                        color="#f59e0b"
                    />
                    <TelemetryChart
                        title="Power Consumption (kW) — Last 24 h"
                        data={mockData}
                        dataKey="power"
                        color="#10b981"
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                        Device Status
                        {isLoading && devices && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                    </h3>
                    <div className="flex flex-col gap-4">
                        {renderDeviceContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
