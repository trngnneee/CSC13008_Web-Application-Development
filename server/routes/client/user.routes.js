import express from "express";
// import * as adminUserController from "../../controller/admin/user.controller.js";
import * as clientUserController from "../../controller/client/user.controller.js";
import * as clientMiddleware from "../../middleware/client/verifyToken.middleware.js";

const router = express.Router();

router.post("/request-upgrade", clientMiddleware.verifyToken, clientMiddleware.authorizeRole("bidder"), clientUserController.requestUpgradeToSeller);

router.get("/my-upgrade-request", clientMiddleware.verifyToken,  clientMiddleware.authorizeRole("bidder"), clientUserController.getMyUpgradeRequest);

router.post("/profile/update", clientMiddleware.verifyToken, clientMiddleware.authorizeRole("bidder", "seller"), clientUserController.updateClientProfile);

router.post("/profile/reset-password", clientMiddleware.verifyToken, clientMiddleware.authorizeRole("bidder", "seller"), clientUserController.resetClientPassword);

//wishlist routes
router.post("/wishlist/add", clientMiddleware.verifyToken, clientUserController.addToWishlist);

router.post("/wishlist/remove", clientMiddleware.verifyToken, clientUserController.removeFromWishlist);

router.get("/wishlist", clientMiddleware.verifyToken, clientUserController.getWishlist);

router.get("/feedback", clientUserController.getFeedback);

router.get("/feedback/:id_user", clientUserController.getFeedbackDetail);

export default router;