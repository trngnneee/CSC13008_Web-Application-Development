import express from 'express';

import * as bidController from '../../controller/client/bid.controller.js';

import { authorizeRole, verifyToken } from '../../middleware/client/verifyToken.middleware.js';

const router = express.Router();

// Cho phép cả bidder và seller đấu giá (seller có thể mua hàng từ seller khác)
router.post('/', verifyToken, authorizeRole("bidder", "seller"), bidController.placeBidPost);

// Seller xem danh sách yêu cầu đấu giá
router.get('/', verifyToken, authorizeRole("seller"), bidController.bidRequestGet);

// Seller phê duyệt yêu cầu đấu giá
router.post('/approve', verifyToken, authorizeRole("seller"), bidController.approveBidRequestPost);

// Seller từ chối yêu cầu đấu giá
router.post('/reject', verifyToken, authorizeRole("seller"), bidController.rejectBidRequestPost);
    
export default router;