import express from 'express';
import * as upgradeRequestController from '../../controllers/admin/upgrade_request.controller.js';
import { verifyAdminToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/total-page', upgradeRequestController.getTotalPages);
router.get('/list', upgradeRequestController.getUpgradeRequests);
router.get('/:id', upgradeRequestController.getUpgradeRequestDetail);
router.put('/:id/approve', verifyAdminToken, upgradeRequestController.approveUpgradeRequest);
router.put('/:id/reject', verifyAdminToken, upgradeRequestController.rejectUpgradeRequest);

export default router;
