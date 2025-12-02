import express from "express";
import * as upgradeRequestController from "../../controller/admin/upgrade_request.controller.js";

const router = express.Router();

router.get("/total-page", upgradeRequestController.getTotalPages);

router.get("/list", upgradeRequestController.getUpgradeRequests);

router.get("/:id", upgradeRequestController.getUpgradeRequestDetail);

router.put("/:id/approve", upgradeRequestController.approveUpgradeRequest);

router.put("/:id/reject", upgradeRequestController.rejectUpgradeRequest);

export default router;