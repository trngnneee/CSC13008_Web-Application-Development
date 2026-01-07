import express from 'express';
import multer from 'multer';
import * as orderController from '../../controller/client/order.controller.js';
import { authorizeRole, verifyToken } from '../../middleware/client/verifyToken.middleware.js';
import { storage } from '../../helper/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

// Get orders I won (as bidder)
router.get('/won', verifyToken, authorizeRole("bidder", "seller"), orderController.getMyWonOrdersGet);

// Get orders I sold (as seller)
router.get('/sold', verifyToken, authorizeRole("seller"), orderController.getMySoldOrdersGet);

// Get specific order by product ID
router.get('/product/:id_product', verifyToken, authorizeRole("bidder", "seller"), orderController.getOrderByProductGet);

// Winner submits payment info (with payment bill image)
router.post('/payment', verifyToken, authorizeRole("bidder", "seller"), upload.single('payment_bill'), orderController.submitPaymentPost);

// Seller confirms payment and ships (with shipping bill image)
router.post('/confirm-payment', verifyToken, authorizeRole("seller"), upload.single('b_l'), orderController.confirmPaymentPost);

// Winner confirms received
router.post('/confirm-received', verifyToken, authorizeRole("bidder", "seller"), orderController.confirmReceivedPost);

// Rate the other party
router.post('/rate', verifyToken, authorizeRole("bidder", "seller"), orderController.rateOrderPost);

// Get rating status for an order
router.get('/rating-status/:id_order', verifyToken, authorizeRole("bidder", "seller"), orderController.getRatingStatusGet);

// Seller cancels order
router.post('/cancel', verifyToken, authorizeRole("seller"), orderController.cancelOrderPost);

export default router;
