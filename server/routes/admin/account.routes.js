import express from "express";
import * as adminController from "../../controller/admin/account.controller.js";
import * as adminMiddleware from "../../middleware/admin/verifyToken.middleware.js"

const router = express.Router();

router.post("/register", adminController.registerPost);

router.post("/login", adminController.loginPost);

router.get("/verifyToken", adminController.verifyTokenGet)

router.post("/forgot-password", adminController.forgotPasswordPost);

router.post("/otp-password", adminController.otpPasswordPost)

router.post("/reset-password", adminMiddleware.verifyToken, adminController.resetPasswordPost);

router.get("/verify-email", adminController.verifyEmailGet);

export default router;