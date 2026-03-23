import express from 'express';
import * as adminController from '../../controllers/admin/account.controller.js';
import { verifyAdminToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.get('/verifyToken', adminController.verifyToken);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/otp-password', adminController.otpPassword);
router.post('/reset-password', verifyAdminToken, adminController.resetPassword);
router.get('/verify-email', adminController.verifyEmail);
router.patch('/change-role/:id_user', verifyAdminToken, adminController.changeRole);
router.get('/get-all-users', verifyAdminToken, adminController.getAllUsersList);
router.get('/logout', verifyAdminToken, adminController.logout);

export default router;
