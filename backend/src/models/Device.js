import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String, // Anedya Device ID
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    relayState: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for isOnline status — threshold configurable via DEVICE_ONLINE_THRESHOLD_MS env var
// Default: 5 minutes. Increase in dev if no real devices are sending heartbeats.
deviceSchema.virtual('isOnline').get(function() {
    const THRESHOLD = parseInt(process.env.DEVICE_ONLINE_THRESHOLD_MS) || 5 * 60 * 1000;
    return (Date.now() - this.lastSeen.getTime()) < THRESHOLD;
});

const Device = mongoose.model('Device', deviceSchema);
export default Device;
