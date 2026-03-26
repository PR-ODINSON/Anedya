import React, { useState, useMemo } from 'react';
import { Activity, ChevronDown, RefreshCw } from 'lucide-react';
import TelemetryChart from '../components/TelemetryChart';
import { useDevices } from '../hooks/useDevices';

// ── Mock data generator ─────────────────────────────────────────────────────
// Produces realistic-looking time-series data when Anedya Cloud isn't live.
const VARIABLES = [
    { id: 'temperature', label: 'Temperature', unit: '°C', base: 24, range: 8, color: '#f59e0b' },
    { id: 'humidity',    label: 'Humidity',    unit: '%',  base: 55, range: 20, color: '#3b82f6' },
    { id: 'power',       label: 'Power',       unit: 'kW', base: 3.2, range: 1.5, color: '#10b981' },
    { id: 'voltage',     label: 'Voltage',     unit: 'V',  base: 230, range: 5, color: '#8b5cf6' },
];

const TIME_RANGES = [
    { label: 'Last 1 h',  hours: 1,  points: 12 },
    { label: 'Last 6 h',  hours: 6,  points: 24 },
    { label: 'Last 24 h', hours: 24, points: 48 },
];

// Simple deterministic seeded PRNG (mulberry32) so each device gets a unique
// but reproducible curve — same device always shows the same shape.
function seededRandom(seed) {
    let s = seed;
    return () => {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Turn a string (device _id) into a numeric seed
function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return h;
}

function generateMockData(variable, hours, points, deviceSeed = 0) {
    const rand = seededRandom(hashStr(String(deviceSeed)) ^ (hours * 1000));
    const now = Date.now();
    const interval = (hours * 3600 * 1000) / points;
    // Each device starts from a slightly different offset within the variable range
    let value = variable.base + (rand() - 0.5) * variable.range;
    return Array.from({ length: points }, (_, i) => {
        const drift = Math.sin((i / points) * Math.PI * 2) * (variable.range * 0.3);
        value += (rand() - 0.49) * (variable.range * 0.15) + drift * 0.1;
        value = Math.max(variable.base - variable.range, Math.min(variable.base + variable.range, value));
        const ts = new Date(now - (points - i) * interval);
        return {
            time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            [variable.id]: parseFloat(value.toFixed(2)),
        };
    });
}

function StatCard({ label, value, unit, color }) {
    return (
        <div className="glass-panel p-4 text-center">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></p>
        </div>
    );
}

function SelectBox({ value, onChange, children, label }) {
    return (
        <div className="relative">
            <label className="block text-xs text-slate-400 font-medium mb-1.5">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition cursor-pointer"
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
        </div>
    );
}

export default function Telemetry() {
    const { devices, isLoading } = useDevices();

    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [selectedVarId,    setSelectedVarId]    = useState(VARIABLES[0].id);
    const [selectedRangeIdx, setSelectedRangeIdx] = useState(0);
    const [refreshKey,       setRefreshKey]        = useState(0);

    const variable  = VARIABLES.find(v => v.id === selectedVarId) || VARIABLES[0];
    const timeRange = TIME_RANGES[selectedRangeIdx];

    // Must be defined before deviceSeed
    const selectedDevice = (devices || []).find(d => d._id === selectedDeviceId) ||
                           (devices && devices.length > 0 ? devices[0] : null);

    // Regenerate mock data when device, variable, time-range, or refresh changes
    // Each device produces a unique but reproducible curve via deterministic seeding
    const deviceSeed = selectedDevice?._id || '';
    const chartData = useMemo(
        () => generateMockData(variable, timeRange.hours, timeRange.points, deviceSeed),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [variable, timeRange, deviceSeed, refreshKey]
    );

    const values   = chartData.map(d => d[variable.id]);
    const minVal   = Math.min(...values).toFixed(2);
    const maxVal   = Math.max(...values).toFixed(2);
    const avgVal   = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Telemetry</h1>
                    <p className="text-slate-400 text-sm mt-1">Explore historical sensor data from your devices.</p>
                </div>
                <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="btn-primary flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                </button>
            </div>

            {/* Selectors */}
            <div className="glass-panel p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectBox
                        label="Device"
                        value={selectedDeviceId}
                        onChange={setSelectedDeviceId}
                    >
                        {isLoading
                            ? <option>Loading…</option>
                            : (devices || []).map(d => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                            ))
                        }
                    </SelectBox>

                    <SelectBox
                        label="Variable"
                        value={selectedVarId}
                        onChange={setSelectedVarId}
                    >
                        {VARIABLES.map(v => (
                            <option key={v.id} value={v.id}>{v.label} ({v.unit})</option>
                        ))}
                    </SelectBox>

                    <SelectBox
                        label="Time Range"
                        value={selectedRangeIdx}
                        onChange={v => setSelectedRangeIdx(Number(v))}
                    >
                        {TIME_RANGES.map((r, i) => (
                            <option key={r.label} value={i}>{r.label}</option>
                        ))}
                    </SelectBox>
                </div>

                {selectedDevice && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <Activity className="w-3.5 h-3.5" />
                        <span>
                            {selectedDevice.name} ·{' '}
                            <span className={selectedDevice.isOnline ? 'text-emerald-400' : 'text-slate-500'}>
                                {selectedDevice.isOnline ? 'Online' : 'Offline'}
                            </span>
                            {' '}· Showing mock data (configure Anedya API key for live data)
                        </span>
                    </div>
                )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Min"     value={minVal} unit={variable.unit} color={variable.color} />
                <StatCard label="Average" value={avgVal} unit={variable.unit} color={variable.color} />
                <StatCard label="Max"     value={maxVal} unit={variable.unit} color={variable.color} />
            </div>

            {/* Chart */}
            <TelemetryChart
                title={`${variable.label} (${variable.unit}) — ${timeRange.label}`}
                data={chartData}
                dataKey={variable.id}
                color={variable.color}
            />
        </div>
    );
}
