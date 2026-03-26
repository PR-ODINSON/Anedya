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

// Virtual for isOnline status (true if checked in within last 5 minutes)
deviceSchema.virtual('isOnline').get(function() {
    const THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
    return (Date.now() - this.lastSeen.getTime()) < THRESHOLD;
});

const Device = mongoose.model('Device', deviceSchema);
export default Device;
