import express from "express";
// import * as adminUserController from "../../controller/admin/user.controller.js";
import * as clientUserController from "../../controller/client/user.controller.js";
import * as clientMiddleware from "../../middleware/client/verifyToken.middleware.js";

const router = express.Router();

// router.get("/get-all-users", adminUserController.getUserList);

router.post("/request-upgrade", clientMiddleware.verifyToken, clientUserController.requestUpgradeToSeller);

router.get("/my-upgrade-request", clientMiddleware.verifyToken, clientUserController.getMyUpgradeRequest);

router.post("/profile/update", clientMiddleware.verifyToken, clientUserController.updateClientProfile);

router.post("/profile/reset-password", clientMiddleware.verifyToken, clientUserController.resetClientPassword);

export default router;