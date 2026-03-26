import Device from '../models/Device.js';
import anedyaService from '../services/anedyaService.js';

// @desc    Get all registered devices
// @route   GET /api/devices
// @access  Private (Admin, Operator, Viewer)
export const getDevices = async (req, res) => {
    try {
        const devices = await Device.find({});
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching devices' });
    }
};

// @desc    Get real-time / historical telemetry for a device
// @route   GET /api/devices/:id/telemetry
// @access  Private
export const getDeviceTelemetry = async (req, res) => {
    const { id } = req.params; // MongoDB device _id or Anedya nodeId
    const { variable, from, to } = req.query;

    try {
        const device = await Device.findById(id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Fetch from Anedya Cloud
        const data = await anedyaService.getDeviceData(
            device.deviceId, 
            variable || 'temperature', 
            from || Date.now() - 3600000, // default last 1 hour
            to || Date.now()
        );

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle device relay
// @route   POST /api/devices/:id/relay
// @access  Private (Admin, Operator only)
export const toggleRelay = async (req, res) => {
    const { id } = req.params;
    const { state } = req.body; // boolean

    try {
        const device = await Device.findById(id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Best-effort: send command to Anedya Cloud.
        // If it fails (e.g. missing API key in dev), log and continue —
        // the local DB state is the source of truth for the dashboard.
        try {
            await anedyaService.sendCommand(device.deviceId, 'relay_toggle', { state });
        } catch (cloudErr) {
            console.warn(`[WARN] Anedya cloud command failed for ${device.deviceId}: ${cloudErr.message}`);
        }

        // Always update local DB state
        device.relayState = state;
        device.lastSeen = Date.now();
        await device.save();

        res.json({ message: `Relay turned ${state ? 'ON' : 'OFF'} successfully`, device });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
