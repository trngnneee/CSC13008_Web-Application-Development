import express from 'express';
import * as commentController from '../../controllers/client/comment.controller.js';
import { verifyClientToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// These REST routes are kept for backward compatibility.
// The primary comment system uses Socket.IO (see sockets/comment.socket.js).
router.post('/create/root', verifyClientToken, commentController.createRootComment);
router.get('/list/:id_product', commentController.getCommentsByProduct);
router.post('/create/reply', verifyClientToken, commentController.createReplyComment);

export default router;
