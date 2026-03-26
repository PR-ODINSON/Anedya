import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Device from './src/models/Device.js';

dotenv.config();

// ─────────────────────────────────────────
// Seed Data
// ─────────────────────────────────────────

const users = [
    {
        name: 'System Admin',
        email: 'admin@anedya.io',
        password: 'Admin@1234',
        role: 'Admin',
        isActive: true,
    },
    {
        name: 'Raj Mehta',
        email: 'raj.mehta@anedya.io',
        password: 'Operator@1234',
        role: 'Operator',
        isActive: true,
    },
    {
        name: 'Priya Singh',
        email: 'priya.singh@anedya.io',
        password: 'Viewer@1234',
        role: 'Viewer',
        isActive: true,
    },
];

// Helpers to produce realistic lastSeen timestamps
const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000);
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

const devices = [
    {
        deviceId: 'node-hvac-001',
        name: 'Main HVAC Unit — Floor 1',
        lastSeen: minutesAgo(2),   // online
        relayState: true,
    },
    {
        deviceId: 'node-hvac-002',
        name: 'HVAC Backup Unit — Floor 2',
        lastSeen: minutesAgo(4),   // online (just within threshold)
        relayState: false,
    },
    {
        deviceId: 'node-pump-001',
        name: 'Water Pump — Rooftop',
        lastSeen: minutesAgo(1),   // online
        relayState: true,
    },
    {
        deviceId: 'node-gen-001',
        name: 'Generator Controller — Basement',
        lastSeen: minutesAgo(3),   // online
        relayState: false,
    },
    {
        deviceId: 'node-light-001',
        name: 'Smart Lighting — Lobby',
        lastSeen: hoursAgo(1),     // offline
        relayState: false,
    },
    {
        deviceId: 'node-sensor-temp-001',
        name: 'Temperature Sensor — Server Room',
        lastSeen: minutesAgo(1),   // online
        relayState: false,
    },
    {
        deviceId: 'node-gate-001',
        name: 'Gate Access Controller — Main Entry',
        lastSeen: hoursAgo(3),     // offline
        relayState: false,
    },
    {
        deviceId: 'node-ups-001',
        name: 'UPS Monitor — Data Center',
        lastSeen: minutesAgo(2),   // online
        relayState: true,
    },
];

// ─────────────────────────────────────────
// Seeder Logic
// ─────────────────────────────────────────

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅  MongoDB connected.\n');

        // ── Users ─────────────────────────────────
        console.log('━━━ Seeding Users ━━━━━━━━━━━━━━━━━━━━━━');
        for (const userData of users) {
            const exists = await User.findOne({ email: userData.email });
            if (!exists) {
                const user = new User(userData); // password hashed by pre-save hook
                await user.save();
                console.log(`  ✔  Created [${user.role.padEnd(8)}]  ${user.email}`);
            } else {
                console.log(`  –  Skipped  [${exists.role.padEnd(8)}]  ${userData.email}  (already exists)`);
            }
        }

        // ── Devices ───────────────────────────────
        console.log('\n━━━ Seeding Devices ━━━━━━━━━━━━━━━━━━━━');
        for (const deviceData of devices) {
            let device = await Device.findOne({ deviceId: deviceData.deviceId });
            if (!device) {
                device = new Device(deviceData);
                await device.save();
                const status = device.isOnline ? '🟢 online ' : '🔴 offline';
                console.log(`  ✔  Created  [${status}]  ${device.deviceId}  —  ${device.name}`);
            } else {
                // Always refresh lastSeen so online/offline status stays accurate
                device.lastSeen = deviceData.lastSeen;
                device.relayState = deviceData.relayState;
                await device.save();
                const status = device.isOnline ? '🟢 online ' : '🔴 offline';
                console.log(`  ↺  Refreshed [${status}]  ${device.deviceId}  —  ${device.name}`);
            }
        }

        console.log('\n🎉  Database seeding complete!\n');
        console.log('━━━ Credentials Summary ━━━━━━━━━━━━━━━━━');
        console.log('  Admin    →  admin@anedya.io       /  Admin@1234');
        console.log('  Operator →  raj.mehta@anedya.io   /  Operator@1234');
        console.log('  Viewer   →  priya.singh@anedya.io /  Viewer@1234');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌  Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
