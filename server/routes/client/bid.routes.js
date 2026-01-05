import express from 'express';

import * as bidController from '../../controller/client/bid.controller.js';

import { authorizeRole, verifyToken } from '../../middleware/client/verifyToken.middleware.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole("bidder"), bidController.placeBidPost);

router.get('/', verifyToken, authorizeRole("seller"), bidController.bidRequestGet);
    
export default router;