import express from 'express';
import * as bidController from '../../controllers/client/bid.controller.js';
import { verifyClientToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyClientToken, authorizeRole('bidder', 'seller'), bidController.placeBid);
router.get('/', verifyClientToken, authorizeRole('seller'), bidController.getBidRequests);
router.get('/product/:id_product', verifyClientToken, authorizeRole('seller'), bidController.getBidRequestsByProduct);
router.post('/approve', verifyClientToken, authorizeRole('seller'), bidController.approveBidRequest);
router.post('/reject', verifyClientToken, authorizeRole('seller'), bidController.rejectBidRequest);
router.get('/my-bidding', verifyClientToken, authorizeRole('bidder', 'seller'), bidController.getMyBiddingProducts);
router.get('/product/:id_product/bidders', verifyClientToken, authorizeRole('seller'), bidController.getBidderListByProduct);
router.post('/product/:id_product/kick', verifyClientToken, authorizeRole('seller'), bidController.kickBidder);
router.post('/product/:id_product/recover', verifyClientToken, authorizeRole('seller'), bidController.recoverBidder);

// Auto-bid routes
router.post('/auto', verifyClientToken, authorizeRole('bidder', 'seller'), bidController.placeAutoBid);
router.get('/auto/:id_product', verifyClientToken, authorizeRole('bidder', 'seller'), bidController.getAutoBid);
router.delete('/auto/:id_product', verifyClientToken, authorizeRole('bidder', 'seller'), bidController.deleteAutoBid);

export default router;
