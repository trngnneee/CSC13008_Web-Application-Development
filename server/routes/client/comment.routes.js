import express from "express";
import * as commentController from "./../../controller/client/comment.controller.js";
import * as clientMiddleware from "../../middleware/client/verifyToken.middleware.js"

const router = express.Router();

router.post("/create/root", clientMiddleware.verifyToken, commentController.commentRootCreatePost)

router.get("/list/:id_product", commentController.commentListGetByProductId)

router.post("/create/reply", clientMiddleware.verifyToken, commentController.commentReplyCreatePost)

export default router;