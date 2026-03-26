import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Device from './src/models/Device.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected correctly.');
        
        // Seed Admin User if not exists
        const adminExists = await User.findOne({ email: 'admin@anedya.io' });
        if (!adminExists) {
            const admin = new User({
                name: 'System Admin',
                email: 'admin@anedya.io',
                password: 'password123', // Will be hashed by pre-save
                role: 'Admin',
                isActive: true
            });
            await admin.save();
            console.log('Default Admin user created (admin@anedya.io / password123)');
        } else {
            console.log('Admin user already exists.');
        }

        // Seed Default Device if not exists
        const deviceExists = await Device.findOne({ deviceId: 'test-device-001' });
        if (!deviceExists) {
            const device = new Device({
                deviceId: 'test-device-001',
                name: 'Main HVAC Unit',
                lastSeen: Date.now(),
                relayState: false
            });
            await device.save();
            console.log('Default test device created.');
        } else {
            console.log('Test device already exists.');
        }

        console.log('Database seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
