import express from 'express';

import * as bidController from '../../controller/client/bid.controller.js';

import { authorizeRole, verifyToken } from '../../middleware/client/verifyToken.middleware.js';

const router = express.Router();

// Cho phép cả bidder và seller đấu giá (seller có thể mua hàng từ seller khác)
router.post('/', verifyToken, authorizeRole("bidder", "seller"), bidController.placeBidPost);

// Seller xem danh sách yêu cầu đấu giá
router.get('/', verifyToken, authorizeRole("seller"), bidController.bidRequestGet);

// Seller xem danh sách yêu cầu đấu giá theo sản phẩm
router.get('/product/:id_product', verifyToken, authorizeRole("seller"), bidController.bidRequestByProductGet);

// Seller phê duyệt yêu cầu đấu giá
router.post('/approve', verifyToken, authorizeRole("seller"), bidController.approveBidRequestPost);

// Seller từ chối yêu cầu đấu giá
router.post('/reject', verifyToken, authorizeRole("seller"), bidController.rejectBidRequestPost);

// Bidder xem danh sách sản phẩm đang tham gia đấu giá
router.get('/my-bidding', verifyToken, authorizeRole("bidder", "seller"), bidController.myBiddingProductsGet);
    
export default router;