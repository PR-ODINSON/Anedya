import express from 'express';
import { getDevices, getDeviceTelemetry, toggleRelay } from '../controllers/deviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// All device routes are protected
router.use(protect);

router.route('/')
    .get(getDevices); // Viewers, Operators, Admins can view

router.route('/:id/telemetry')
    .get(getDeviceTelemetry);

// Only Admin and Operator can control the relay
router.route('/:id/relay')
    .post(requirePermission('relay:toggle'), toggleRelay);

export default router;
