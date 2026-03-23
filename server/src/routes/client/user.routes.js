import express from 'express';
import * as clientUserController from '../../controllers/client/user.controller.js';
import { verifyClientToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/request-upgrade', verifyClientToken, authorizeRole('bidder'), clientUserController.requestUpgradeToSeller);
router.get('/my-upgrade-request', verifyClientToken, authorizeRole('bidder'), clientUserController.getMyUpgradeRequest);
router.post('/profile/update', verifyClientToken, authorizeRole('bidder', 'seller'), clientUserController.updateProfile);
router.post('/profile/reset-password', verifyClientToken, authorizeRole('bidder', 'seller'), clientUserController.resetClientPassword);
router.post('/wishlist/add', verifyClientToken, clientUserController.addToWishlist);
router.post('/wishlist/remove', verifyClientToken, clientUserController.removeFromWishlist);
router.get('/wishlist', verifyClientToken, clientUserController.getWishlist);
router.get('/feedback', clientUserController.getFeedback);
router.get('/feedback/:id_user', clientUserController.getFeedbackDetail);

export default router;
