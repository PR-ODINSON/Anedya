import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.js';
import helmet from 'helmet';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Secure API headers
app.use(helmet());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Basic route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'IoT Dashboard API is running' });
});

// Import and mount routers
import authRoutes from './src/routes/authRoutes.js';
import deviceRoutes from './src/routes/deviceRoutes.js';
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

// Error Fallback
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
