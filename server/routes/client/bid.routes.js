import express from 'express';

import * as bidController from '../../controller/client/bid.controller.js';

import { authorizeRole, verifyToken } from '../../middleware/client/verifyToken.middleware.js';

const router = express.Router();

// Cho phép cả bidder và seller đấu giá (seller có thể mua hàng từ seller khác)
router.post('/', verifyToken, authorizeRole("bidder", "seller"), bidController.placeBidPost);

router.get('/', verifyToken, authorizeRole("seller"), bidController.bidRequestGet);
    
export default router;