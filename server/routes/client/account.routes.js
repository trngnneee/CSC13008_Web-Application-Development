import express from "express";
import * as clientController from "../../controller/client/account.controller.js";
import * as clientMiddleware from "../../middleware/client/verifyToken.middleware.js"

const router = express.Router();

router.post("/register", clientController.registerPost);

router.post("/login", clientController.loginPost);

router.get("/verifyToken", clientController.verifyTokenGet);

router.post("/forgot-password", clientController.forgotPasswordPost);

router.post("/otp-password", clientController.otpPasswordPost);

router.post("/reset-password", clientMiddleware.verifyToken, clientMiddleware.authorizeRole("bidder", "seller"), clientController.resetPasswordPost);

router.get("/verify-email", clientController.verifyEmailGet);

router.get("/logout", clientController.logoutGet);

export default router;