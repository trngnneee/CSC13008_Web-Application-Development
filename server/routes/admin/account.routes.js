import express from "express";
import * as adminController from "../../controller/admin/account.controller.js";

const router = express.Router();

router.post("/register", adminController.registerPost);

router.post("/login", adminController.loginPost);

router.get("/verifyToken", adminController.verifyTokenGet)

export default router;