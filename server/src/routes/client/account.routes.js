import express from 'express';
import * as clientController from '../../controllers/client/account.controller.js';
import { verifyClientToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', clientController.register);
router.post('/login', clientController.login);
router.get('/verifyToken', clientController.verifyToken);
router.post('/forgot-password', clientController.forgotPassword);
router.post('/otp-password', clientController.otpPassword);
router.post('/reset-password', verifyClientToken, authorizeRole('bidder', 'seller'), clientController.resetPassword);
router.get('/verify-email', clientController.verifyEmail);
router.get('/logout', clientController.logout);

export default router;
