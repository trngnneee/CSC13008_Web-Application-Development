import express from 'express';
import * as orderController from '../../controllers/client/order.controller.js';
import { verifyClientToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { uploadCloudinary } from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/won', verifyClientToken, authorizeRole('bidder', 'seller'), orderController.getMyWonOrders);
router.get('/sold', verifyClientToken, authorizeRole('seller'), orderController.getMySoldOrders);
router.get('/product/:id_product', verifyClientToken, authorizeRole('bidder', 'seller'), orderController.getOrderByProduct);
router.post('/payment', verifyClientToken, authorizeRole('bidder', 'seller'), uploadCloudinary.single('payment_bill'), orderController.submitPayment);
router.post('/confirm-payment', verifyClientToken, authorizeRole('seller'), uploadCloudinary.single('b_l'), orderController.confirmPayment);
router.post('/confirm-received', verifyClientToken, authorizeRole('bidder', 'seller'), orderController.confirmReceived);
router.post('/rate', verifyClientToken, authorizeRole('bidder', 'seller'), orderController.rateOrder);
router.get('/rating-status/:id_order', verifyClientToken, authorizeRole('bidder', 'seller'), orderController.getRatingStatus);
router.post('/cancel', verifyClientToken, authorizeRole('seller'), orderController.cancelOrder);

export default router;
