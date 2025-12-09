import express from "express";
import * as upgradeRequestController from "../../controller/admin/upgrade_request.controller.js";
import * as adminMiddleware from "../../middleware/admin/verifyToken.middleware.js"

const router = express.Router();

router.get("/total-page", upgradeRequestController.getTotalPages);

router.get("/list", upgradeRequestController.getUpgradeRequests);

router.get("/:id", upgradeRequestController.getUpgradeRequestDetail);

router.put("/:id/approve", adminMiddleware.verifyToken, upgradeRequestController.approveUpgradeRequest);

router.put("/:id/reject", adminMiddleware.verifyToken, upgradeRequestController.rejectUpgradeRequest);

export default router;