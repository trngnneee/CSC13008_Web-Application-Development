import express from 'express';

import * as bidController from '../../controller/client/bid.controller.js';

import { authorizeRole, verifyToken } from '../../middleware/client/verifyToken.middleware.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole("bidder"), bidController.placeBidPost);

export default router;